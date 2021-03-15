const Sentencer = require("sentencer");
const verbs = require("./verbs.js");
const adverbs = require("./adverbs.js");

const choose = (list) => list[Math.floor(Math.random() * list.length)];

{
  let adjectives = require("sentencer/words/adjectives");
  let nouns = require("sentencer/words/nouns");
  adjectives = adjectives.filter(word => word.match(/^[\w-]+$/));
  nouns = nouns.filter(word => word.match(/^[\w-]+$/));

  const remove = (list, words) => {
    for (word of words) {
      if (list.includes(word)) {
        list.splice(list.indexOf(word), 1);
      }
    }
  };
  remove(adjectives, ["japan", "niggard"]);
  remove(nouns, ["abyssinian", "algeria", "america", "australia", "australian", "balinese", "belgian", "bengal", "chinese", "cuban", "german", "germany", "greece", "greek", "guatemalan", "himalayan", "iran", "iraq", "israel", "italian", "italy", "japan", "japanese", "korean", "malaysia", "mexico", "mexican", "norwegian", "pakistan", "persian", "peru", "poland", "polish", "romania", "romanian", "russia", "russian", "siamese", "siberian", "sudan", "taiwan", "yugoslavian"]);

  Sentencer.configure({
    adjectiveList: adjectives,
    nounList: nouns,
    actions: {
      verb: () => choose(verbs),
      verbs: () => choose(verbs) + "s",
      verbing: () => choose(verbs) + "ing",
      verbly: () => choose(adverbs),
    }
  });
}

const templates = [
  "{{ nouns }}-{{ verb }}-{{ noun }}-{{ verbs }}",
  "{{ verbly }}-{{ verbing }}-{{ adjective }}-{{ nouns }}",
  "{{ adjective }}-{{ noun }}-{{ verbing }}-{{ verbly }}-{{ adjective }}",
  "{{ verbly }}-{{verbing}}-too-many-{{ nouns }}",
  "{{ verbly }}-{{ adjective }}-{{ nouns }}-{{ adjective }}",
];

module.exports = function generateRoomName() {
  return Sentencer.make(choose(templates)).toLowerCase();
};
