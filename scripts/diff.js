const hasExcludeFile = (path, filesToExclude) =>
  filesToExclude.some((file) => path.match(new RegExp(file)));

function splitDiffs(diffContent, targetFolder, filesToExclude) {
  return diffContent
    .split("\ndiff --git ")
    .map((diff) => {
      const fullDiff = "diff --git " + diff;
      const filePath = fullDiff.split("\n")[0];
      const [, aPath, bPath] = filePath.split(" ").slice(1);

      const aHasExcludeFile = hasExcludeFile(aPath, filesToExclude);
      const bHasExcludeFile = hasExcludeFile(bPath, filesToExclude);

      if (aHasExcludeFile || bHasExcludeFile) {
        return null;
      }

      if (
        aPath.startsWith(`a/${targetFolder}`) &&
        bPath.startsWith(`b/${targetFolder}`)
      ) {
        return fullDiff;
      }

      return null;
    })
    .filter(Boolean);
}

module.exports = {
  splitDiffs,
};
