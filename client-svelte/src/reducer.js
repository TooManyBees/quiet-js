import { newDeck } from "./game.js";

export function initialState() {
  return {
    phase: "pregame",
    deck: null,
    yourTurn: null,
    turnNumber: 0,
    resources: [],
    abundancies: [],
    scarcities: [],
    projects: [],
    contempt: {},
    canvasSize: {
      width: 256,
      height: 256,
    },
    history: [],
  };
}

export function withoutYourTurn(state) {
  return {
    ...state,
    yourTurn: null,
  };
}

export function reducer(state, action) {
  switch(action.type) {
    case "game:initiate-start": {
      return {
        ...state,
        phase: "starting",
      }
    }
    case "game:start": {
      const fleeting = action.payload.fleeting;
      return {
        ...state,
        phase: "started",
        deck: newDeck(fleeting),
      };
    }
    case "game:begin-your-turn": {
      return {
        ...state,
        yourTurn: {
          drawn: null,
          numberOfProjects: state.projects.length,
        },
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
        yourTurn: null,
        turnNumber: state.turnNumber + 1,
      };
    }
    case "game:place-project": {
      return {
        ...state,
        projects: [...state.projects, action.payload.project],
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
