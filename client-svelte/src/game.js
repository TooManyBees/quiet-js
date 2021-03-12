const suit = (s) => ["ACE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", "JACK", "QUEEN", "KING"].map(n => `${n}_${s}`);

function shuffle(arr) {
  for (let i = 1; i < arr.length; i++) {
    const j = Math.floor(Math.random() * i);
    const tmp = arr[j];
    arr[j] = arr[i];
    arr[i] = tmp;
  }
  return arr;
}

export function newDeck(fleeting = false) {
  const hearts = shuffle(suit("HEARTS"));
  const diamonds = shuffle(suit("DIAMONDS"));
  const clubs = shuffle(suit("CLUBS"));
  const spades = shuffle(suit("SPADES"));

  if (fleeting) {
    hearts.splice(0, 4);
    const k_d = diamonds.indexOf("KING_DIAMONDS");
    diamonds.splice(k_d, 1);
    diamonds.splice(0, 3);
    clubs.splice(0, 4);
    spades.splice(0, 4);
    const k_s = spades.indexOf("KING_SPADES");
    if (k_s === -1) {
      spades[Math.floor(Math.random() * spades.length)] = "KING_SPADES";
    }
  }

  return hearts.concat(diamonds).concat(clubs).concat(spades);
}

export class Project {
  constructor(weeks, coordinates) {
    this.weeks = weeks;
    this.coordinates = coordinates;
  }

  isFinished() {
    this.weeks === 0;
  }
}
