/**
 * Overrides the wet4 equal height if it doesnt work.
 * @param {string} divId1 - HTML id of div to compare to second parameter
 * @param {string} divId2 - HMTL id of div to compare to first parameter
 */
export function equalizeHeight(divId1, divId2) {
  const d1 = document.getElementById(divId1);
  const d2 = document.getElementById(divId2);

  d1.style.height = "auto";
  d2.style.height = "auto";

  const d1Height = d1.clientHeight;
  const d2Height = d2.clientHeight;

  const maxHeight = Math.max(d1Height, d2Height);
  if (d1Height !== maxHeight || d2Height !== maxHeight) {
    d1.style.height = `${maxHeight}px`;
    d2.style.height = `${maxHeight}px`;
  }
}

export const cerPalette = {
  "Night Sky": "#054169",
  Sun: "#FFBE4B",
  Ocean: "#5FBEE6",
  Forest: "#559B37",
  Flame: "#FF821E",
  Aubergine: "#871455",
  "Dim Grey": "#8c8c96",
  "Cool Grey": "#42464B",
  hcBlue: "#7cb5ec",
  hcGreen: "#90ed7d",
  hcPink: "#f15c80",
  hcRed: "#f45b5b",
  hcAqua: "#2b908f",
  hcPurple: "#8085e9",
  hcLightBlue: "#91e8e1",
};
