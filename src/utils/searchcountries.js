import no from "../data/countries/countries_no.json";
import de from "../data/countries/countries_de.json";
import fr from "../data/countries/countries_fr.json";
import en from "../data/countries/countries_en.json";

import list from "../data/countries/jhcountries.json";

// // https://gist.github.com/yesvods/51af798dd1e7058625f4#gistcomment-2365119
function concatAndDeDuplicateObjects(p, ...arrs) {
  return []
    .concat(...arrs)
    .reduce(
      (a, b) => (!a.filter((c) => b[p] === c[p]).length ? [...a, b] : a),
      []
    );
}

let unfiltered = concatAndDeDuplicateObjects("name", no, de, fr, en);

let filtered = unfiltered.filter((f) =>
  list.map((v) => v.toLowerCase()).includes(f.alpha3)
);

filtered = filtered.map((item) => {
  return {
    label: item.name,
    value: item.alpha3,
  };
});

// antall countries (184 skrivende stund)
// console.log(concatAndDeDuplicateObjects("alpha3", filtered));

export const countries = filtered;
