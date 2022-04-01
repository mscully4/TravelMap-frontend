export const GRANULARITY_CUTOFF = 11;

export enum GRANULARITIES {
  PLACES = "places",
  DESTINATIONS = "destinations",
}

export const granularitySwitcher = (
  granularity: GRANULARITIES,
  dest: any,
  place: any
) => {
  switch (granularity) {
    case GRANULARITIES.DESTINATIONS:
      return dest;
    case GRANULARITIES.PLACES:
      return place;
  }
};
