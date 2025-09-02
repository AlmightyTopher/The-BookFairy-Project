# Book Fairy AI Communication Commands

## 🔒 Code Safety Commands[ENG / M4B]

### **Permission Phrases (Required for Code Changes)**

```
# permission to modify
```
**Purpose**: Grants authorization to modify existing code after test-before-modify workflow is complete.

```
# approved to replace original  
```
**Purpose**: Confirms that tested code changes can replace the original implementation.

```
# safe to overwrite
```
**Purpose**: Authorizes overwriting existing files when confident that behavior will be preserved.

```
# cleanup approved
```
**Purpose**: Permits removal of test clones and temporary code created during testing.

```
# expand to other modules
```
**Purpose**: Grants permission to modify code outside the current file scope.

### **Session Management**

```
# end_session_summary
```
**Purpose**: Triggers comprehensive session summary including all changes, test clones created, and cleanup requirements.

## 📝 Todo Management Commands

### **Project Tracking Protocol**

```
"From now on record changes in the todo.md list if it isn't on the list add it. if we completed it mark it done"
```
**Purpose**: Establishes Todo.md as single source of truth - AI must automatically track all work, mark completions, and add new items to appropriate priority sections.

## 🎯 Priority Management Commands

### **Feature Control**

```
"for now lets skip [FEATURE NAME]"
```
**Purpose**: Moves specified feature to lower priority or deferred status in Todo.md.

```
"Remove any items that require [DEPENDENCY]"
```
**Purpose**: Eliminates all Todo.md items dependent on specified technology or service.

```
"Add [FEATURE DESCRIPTION] to the Todo.md list"
```
**Purpose**: Adds new feature requirement to appropriate priority section in Todo.md.

## 🚀 Development Environment Commands

### **Environment Control**

```
"run dev"
```
**Purpose**: Start development server - AI should execute `npm run dev` and track startup status in Todo.md.

## 🧪 AI Safety Protocol

### **Test-Before-Modify Workflow**
- AI must create test clones before any code changes
- AI must wait for explicit permission phrases before modifying original code
- AI must preserve existing behavior unless explicitly authorized to change it
- AI must track all work in Todo.md automatically

### **Communication Rules**
- AI will not modify code without following safety protocol
- AI will ask for clarification rather than assume intent
- AI will propose changes separately and explain them
- AI will maintain Todo.md as project documentation

---

*This file contains only the essential commands for human-AI communication during development sessions.*
