import { newDeck } from "./game.js";

export function initialState() {
  return {
    phase: "pregame",
    deck: null,
    yourTurn: {
      drawn: 0,
      numberOfProjects: 0,
    },
    currentPeerId: null,
    projects: [],
    canvasSize: {
      width: 256,
      height: 256,
    },
    history: [],
  };
}

export function reducer(state, action) {
  switch(action.type) {
    case "game:initiate-start": {
      return {
        ...state,
        phase: "starting",
      };
    }
    case "game:cancel-start": {
      return {
        ...state,
        phase: "pregame",
      };
    }
    case "game:start": {
      const { fleeting, userId } = action.payload;
      return {
        ...state,
        phase: "started",
        deck: newDeck(fleeting),
        currentPeerId: userId,
      };
    }
    case "game:draw-card": {
      const drawn = state.deck[0];
      const deck = state.deck.slice(1);
      return {
        ...state,
        yourTurn: {
          ...state.yourTurn,
          drawn,
        },
        deck,
      };
    }
    case "game:next-turn": {
      return {
        ...state,
        currentPeerId: action.payload.nextPeerId,
      };
    }
    case "game:end-turn": {
      const { drawn, numberOfProjects } = state.yourTurn;
      const { userId, nextPeerId } = action.payload;
      let projects = state.projects;
      if (drawn) {
        projects = [
          ...projects.slice(0, numberOfProjects).map(p => ({
            ...p,
            weeks: Math.max(0, p.weeks - 1),
          })),
          ...projects.slice(numberOfProjects),
        ];
      }
      const history = drawn
        ? [drawn, ...state.history]
        : state.history;

      return {
        ...state,
        yourTurn: {
          drawn: null,
          numberOfProjects: projects.length,
        },
        currentPeerId: nextPeerId,
        projects,
        history,
      };
    }
    case "game:place-project": {
      return {
        ...state,
        projects: [...state.projects, action.payload.project],
      };
    }
    case "game:remove-project": {
      const projects = [...state.projects];
      const idx = projects.findIndex(p => p.id === action.payload.id);
      if (idx) {
        projects.splice(idx, 1);
      }
      return {
        ...state,
        projects,
      };
    }
    case "canvas:expand": {
      return {
        ...state,
        canvasSize: action.payload,
      };
    }
    default: {
      return state;
    }
  }
}
