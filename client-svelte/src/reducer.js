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
      x: 256,
      y: 256,
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
    default: {
      return state;
    }
  }
}
