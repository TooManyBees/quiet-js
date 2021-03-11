const suit = (s) => [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"].map(n => `${n}_${s}`);

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
  const hearts = shuffle(suit("H"));
  const diamonds = shuffle(suit("D"));
  const clubs = shuffle(suit("C"));
  const spades = shuffle(suit("S"));

  if (fleeting) {
    hearts.splice(0, 4);
    const k_d = diamonds.indexOf("K_D");
    diamonds.splice(k_d, 1);
    diamonds.splice(0, 3);
    clubs.splice(0, 4);
    spades.splice(0, 4);
    const k_s = spades.indexOf("K_S");
    if (k_s === -1) {
      spades[Math.floor(Math.random() * spades.length)] = "K_S";
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
