async function translateToStandardResults(json) {
  // ASSUMPTION: we're only testing one file
  // this is true for all content built so far
  const fileName = Object.keys(json)[0];

  const { test_results: testResults } = json[fileName];

  let completed = true;
  let stderr = null;
  const stdout = Object.keys(testResults).map((testName) => {
    const { success, decoded_logs } = testResults[testName];

    if (!success) {
      completed = false;
    }

    const result = {
      tag: success ? "passed" : "failed",
      value: success ? "Test Passed" : decoded_logs,
      logs: success ? decoded_logs.join("\n") : [],
    };

    return { tag: "it", value: testName, result, children: [] };
  });

  return { completed, stdout, stderr };
}
exports.translateToStandardResults = translateToStandardResults;
