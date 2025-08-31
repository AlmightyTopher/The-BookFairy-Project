import { logger } from './logger';

export interface BookProfile {
  title: string;
  author: string;
  series?: string;
  isbn?: string;
  publisher?: string;
  year?: string;
  audience?: 'children' | 'middle-grade' | 'YA' | 'adult' | 'academic' | 'general';
  format?: 'novel' | 'picture_book' | 'textbook' | 'comic' | 'graphic_novel' | 'short_story_collection' | 'anthology' | 'reference' | 'poetry' | 'audiobook';
  genre?: string;
  subgenres?: string[];
  themes?: string[];
  tone_style?: string[];
  notable_features?: string[];
}

export interface SimilarityMatch {
  title: string;
  author: string;
  genre: string;
  subgenre?: string;
  audience?: string;
  format?: string;
  why_similar: string;
  similarity_axes: string[];
  matchScore: number;
}

export class BookSimilarityEngine {
  private static readonly AUDIENCE_WEIGHTS = {
    exact: 1.0,
    adjacent: 0.5,  // e.g., YA to Adult
    incompatible: 0  // e.g., Children's to Academic
  };

  private static readonly AUDIENCE_COMPATIBILITY: Record<string, string[]> = {
    'children': ['children', 'middle-grade'],
    'middle-grade': ['children', 'middle-grade', 'YA'],
    'YA': ['middle-grade', 'YA', 'adult'],
    'adult': ['YA', 'adult', 'academic'],
    'academic': ['adult', 'academic'],
    'general': ['children', 'middle-grade', 'YA', 'adult']
  };

  static profileFromReadarrBook(book: any): BookProfile {
    try {
      const profile: BookProfile = {
        title: book.title,
        author: book.authorName || book.author || 'Unknown Author',
        genre: book.genres?.[0],
        audience: this.inferAudience(book),
        themes: this.inferThemes(book),
        tone_style: this.inferToneStyle(book)
      };

      // Try to determine format from book data
      if (book.pageCount) {
        profile.format = book.pageCount < 100 ? 'short_story_collection' : 'novel';
      }

      return profile;
    } catch (error) {
      logger.error({ error, book }, 'Error creating book profile');
      return {
        title: book.title || 'Unknown Title',
        author: book.authorName || book.author || 'Unknown Author'
      };
    }
  }

  private static inferAudience(book: any): BookProfile['audience'] {
    const title = book.title?.toLowerCase() || '';
    const description = book.overview?.toLowerCase() || '';
    
    if (book.genres?.includes('Children')) return 'children';
    if (book.genres?.includes('Young Adult') || book.genres?.includes('YA')) return 'YA';
    if (book.genres?.includes('Academic') || description.includes('textbook')) return 'academic';
    return 'adult';
  }

  private static inferThemes(book: any): string[] {
    const themes = new Set<string>();
    const description = book.overview?.toLowerCase() || '';

    // Common themes to look for
    const themePatterns = {
      'coming-of-age': /(coming of age|growing up|childhood|adolescence)/,
      'survival': /(survival|survive|surviving)/,
      'politics': /(politics|political|power struggle)/,
      'love': /(love|romance|relationship)/,
      'adventure': /(adventure|quest|journey)/,
      'science': /(science|scientific|discovery)/,
      'family': /(family|families|parents|siblings)/,
      'mystery': /(mystery|mysteries|detective)/
    };

    // Check description for themes
    Object.entries(themePatterns).forEach(([theme, pattern]) => {
      if (pattern.test(description)) {
        themes.add(theme);
      }
    });

    // Add themes based on genres
    if (book.genres) {
      book.genres.forEach((genre: string) => {
        if (['Mystery', 'Thriller'].includes(genre)) themes.add('mystery');
        if (['Romance', 'Love Story'].includes(genre)) themes.add('love');
        if (['Science Fiction', 'Hard Science Fiction'].includes(genre)) themes.add('science');
      });
    }

    return Array.from(themes);
  }

  private static inferToneStyle(book: any): string[] {
    const tones = new Set<string>();
    const description = book.overview?.toLowerCase() || '';

    // Common tones to look for
    const tonePatterns = {
      'humorous': /(humor|funny|comedy|wit|satirical)/,
      'dark': /(dark|grim|dystopian|bleak)/,
      'epic': /(epic|grand|saga|sweeping)/,
      'lyrical': /(lyrical|poetic|beautiful prose)/,
      'instructional': /(guide|learn|step-by-step|tutorial)/,
      'whimsical': /(whimsical|playful|magical|charming)/
    };

    Object.entries(tonePatterns).forEach(([tone, pattern]) => {
      if (pattern.test(description)) {
        tones.add(tone);
      }
    });

    return Array.from(tones);
  }

  static findSimilarBooks(seedBook: BookProfile, candidates: BookProfile[]): SimilarityMatch[] {
    const matches = candidates
      .filter(book => book.title !== seedBook.title) // Filter out the seed book
      .map(book => {
        const matchScore = this.calculateSimilarity(seedBook, book);
        const similarityAxes = this.getSimilarityAxes(seedBook, book);
        const why_similar = this.generateSimilarityReason(seedBook, book);
        
        return {
          title: book.title,
          author: book.author,
          genre: book.genre || '',
          subgenre: book.subgenres?.[0],
          audience: book.audience,
          format: book.format,
          why_similar,
          similarity_axes: similarityAxes,
          matchScore
        };
      })
      .filter(match => 
        match.matchScore >= 4.0 && // Pass weighted threshold
        match.similarity_axes.length >= 2 // At least 2 matching axes
      )
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5); // Top 5 matches

    return matches.length >= 2 ? matches : []; // Need at least 2 good matches
  }

  private static calculateSimilarity(book1: BookProfile, book2: BookProfile): number {
    let score = 0;
    const weights = {
      genre: 3,
      audience: 2,
      themes: 2,
      tone_style: 1,
      structure: 1
    };

    // Genre match (weight: 3)
    if (book1.genre && book2.genre) {
      if (book1.genre === book2.genre) {
        score += weights.genre;
        // Additional subgenre bonus
        if (book1.subgenres && book2.subgenres) {
          const commonSubgenres = book1.subgenres.filter(sg => book2.subgenres?.includes(sg));
          if (commonSubgenres.length > 0) score += 0.5;
        }
      }
    }

    // Audience compatibility (weight: 2)
    if (book1.audience && book2.audience) {
      const audienceScore = this.calculateAudienceCompatibility(book1.audience, book2.audience);
      score += audienceScore * weights.audience;
    }

    // Theme overlap (weight: 2)
    if (book1.themes && book2.themes) {
      const commonThemes = book1.themes.filter(theme => book2.themes?.includes(theme));
      if (commonThemes.length > 0) {
        const themeOverlap = commonThemes.length / Math.max(book1.themes.length, book2.themes.length);
        score += themeOverlap * weights.themes;
      }
    }

    // Tone/style similarity (weight: 1)
    if (book1.tone_style && book2.tone_style) {
      const commonTones = book1.tone_style.filter(tone => book2.tone_style?.includes(tone));
      if (commonTones.length > 0) {
        const toneOverlap = commonTones.length / Math.max(book1.tone_style.length, book2.tone_style.length);
        score += toneOverlap * weights.tone_style;
      }
    }

    // Narrative/structure match (weight: 1)
    if (book1.notable_features && book2.notable_features) {
      const commonFeatures = book1.notable_features.filter(f => book2.notable_features?.includes(f));
      if (commonFeatures.length > 0) {
        const structureOverlap = commonFeatures.length / Math.max(book1.notable_features.length, book2.notable_features.length);
        score += structureOverlap * weights.structure;
      }
    }

    // Format validation
    if (book1.format && book2.format && book1.format !== book2.format) {
      return 0; // Hard filter on format mismatch
    }

    // Pass threshold is 4.0
    return score;
  }

  private static calculateAudienceCompatibility(audience1: BookProfile['audience'], audience2: BookProfile['audience']): number {
    if (!audience1 || !audience2) return this.AUDIENCE_WEIGHTS.incompatible;
    if (audience1 === audience2) return this.AUDIENCE_WEIGHTS.exact;
    
    const compatibleAudiences = this.AUDIENCE_COMPATIBILITY[audience1 as keyof typeof this.AUDIENCE_COMPATIBILITY];
    if (compatibleAudiences?.includes(audience2)) return this.AUDIENCE_WEIGHTS.adjacent;
    
    return this.AUDIENCE_WEIGHTS.incompatible;
  }

  private static getSimilarityAxes(book1: BookProfile, book2: BookProfile): string[] {
    const axes: string[] = [];

    // Genre match
    if (book1.genre && book2.genre && book1.genre === book2.genre) {
      axes.push('genre');
      // Check subgenre overlap
      if (book1.subgenres && book2.subgenres) {
        const commonSubgenres = book1.subgenres.filter(sg => book2.subgenres?.includes(sg));
        if (commonSubgenres.length > 0) axes.push('subgenre');
      }
    }

    // Audience compatibility
    if (book1.audience && book2.audience) {
      const audienceScore = this.calculateAudienceCompatibility(book1.audience, book2.audience);
      if (audienceScore > 0) axes.push('audience');
    }

    // Theme overlap
    if (book1.themes && book2.themes) {
      const commonThemes = book1.themes.filter(theme => book2.themes?.includes(theme));
      if (commonThemes.length > 0) axes.push('themes');
    }

    // Tone/style similarity
    if (book1.tone_style && book2.tone_style) {
      const commonTones = book1.tone_style.filter(tone => book2.tone_style?.includes(tone));
      if (commonTones.length > 0) axes.push('tone_style');
    }

    // Structure/features similarity
    if (book1.notable_features && book2.notable_features) {
      const commonFeatures = book1.notable_features.filter(f => book2.notable_features?.includes(f));
      if (commonFeatures.length > 0) axes.push('structure');
    }

    return axes;
  }

  private static generateSimilarityReason(seedBook: BookProfile, matchBook: BookProfile): string {
    const reasons: string[] = [];

    // Check genre and subgenre matches
    if (seedBook.genre && matchBook.genre && seedBook.genre === matchBook.genre) {
      const subgenreMatch = seedBook.subgenres?.find(sg => matchBook.subgenres?.includes(sg));
      if (subgenreMatch) {
        reasons.push(`shares ${subgenreMatch} ${seedBook.genre.toLowerCase()}`);
      } else {
        reasons.push(`similar ${seedBook.genre.toLowerCase()} elements`);
      }
    }

    // Check theme overlap
    if (seedBook.themes && matchBook.themes) {
      const commonThemes = seedBook.themes.filter(theme => matchBook.themes?.includes(theme));
      if (commonThemes.length > 0) {
        reasons.push(`explores themes of ${commonThemes.slice(0, 2).join(' and ')}`);
      }
    }

    // Check tone/style similarity
    if (seedBook.tone_style && matchBook.tone_style) {
      const commonTones = seedBook.tone_style.filter(tone => matchBook.tone_style?.includes(tone));
      if (commonTones.length > 0) {
        reasons.push(`uses ${commonTones[0]} style`);
      }
    }

    // Check structural features
    if (seedBook.notable_features && matchBook.notable_features) {
      const commonFeatures = seedBook.notable_features.filter(f => matchBook.notable_features?.includes(f));
      if (commonFeatures.length > 0) {
        reasons.push(`similar ${commonFeatures[0]} structure`);
      }
    }

    if (reasons.length === 0) {
      return "matches on multiple narrative elements";
    }

    return reasons.join(' and ');
  }
}
