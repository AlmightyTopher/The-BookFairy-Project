export type Step =
  | "root"
  | "choose_action"  
  | "find_book"
  | "ask_author"
  | "ask_title"
  | "confirm"
  | "queued";

export const BUTTONS = {
  ROOT: ["Get a book", "Search by genre", "Check status", "Help"],
  CHOOSE_ACTION: ["Find by title", "Find by author", "Browse genres", "Back"],
  FIND_BOOK: ["Search again", "Back to menu"],
  CONFIRM: ["Yes, download it!", "No, search more", "Back to menu"]
} as const;

export const isInputWindow = (step: Step): boolean => 
  ["ask_author", "ask_title"].includes(step);

export const getNextStep = (currentStep: Step, input: string): Step => {
  switch (currentStep) {
    case "root":
      return "choose_action";
    case "choose_action":
      if (input === "Get a book") return "ask_title";
      if (input === "Find by author") return "ask_author";
      if (input === "Find by title") return "ask_title";
      return "root";
    case "ask_author":
    case "ask_title":
      return "confirm";
    case "confirm":
      return input === "Yes, download it!" ? "queued" : "root";
    default:
      return "root";
  }
};

export const getButtons = (step: Step): readonly string[] => {
  switch (step) {
    case "root":
      return BUTTONS.ROOT;
    case "choose_action":
      return BUTTONS.CHOOSE_ACTION;
    case "confirm":
      return BUTTONS.CONFIRM;
    default:
      return [];
  }
};
