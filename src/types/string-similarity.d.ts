declare module 'string-similarity' {
  export function compareTwoStrings(s1: string, s2: string): number;
  export function findBestMatch(
    main: string,
    targets: string[]
  ): {
    bestMatch: { target: string; rating: number; index: number };
    ratings: Array<{ target: string; rating: number }>;
  };
  const stringSimilarity: {
    compareTwoStrings: typeof compareTwoStrings;
    findBestMatch: typeof findBestMatch;
  };
  export default stringSimilarity;
}
