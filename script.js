function buildMatrix() {
  const equationCount = parseInt(document.getElementById("eqCount").value);
  const variableCount = parseInt(document.getElementById("varCount").value);
  const container = document.getElementById("matrixContainer");
  container.innerHTML = "";

  if (!equationCount || !variableCount) return alert("Enter both values!");

  let html = "<table>\n<tbody>";
  for (let r = 0; r < equationCount; r++) {
    html += "<tr>";
    for (let c = 0; c <= variableCount; c++) {
      html += `<td><input id="cell-${r}-${c}" type="number" placeholder="${
        c === variableCount ? "Ans" : "a" + (r + 1) + (c + 1)
      }"></td>`;
    }
    html += "</tr>";
  }
  html += "</tbody></table>";
  container.innerHTML = html;
  document.getElementById("solveBtn").style.display = "block";
}

function solve() {
  const n = parseInt(document.getElementById("eqCount").value);
  const v = parseInt(document.getElementById("varCount").value);
  const resultsDiv = document.getElementById("results");
  const method =
    document.querySelector('input[name="method"]:checked')?.value ??
    "gaussJordan";

  let matrix = Array.from({ length: n }, () => Array(v + 1).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c <= v; c++) {
      matrix[r][c] = parseFloat(
        document.getElementById(`cell-${r}-${c}`).value || 0
      );
    }
  }

  resultsDiv.style.display = "block";
  resultsDiv.innerHTML = "<h2>Solution Steps:</h2>";

  const printStep = (msg) => {
    resultsDiv.innerHTML += `<p>${msg}</p>`;
  };

  const printMatrix = (matrix) => {
    let html = `
    <table class="matrix-table">
  `;

    for (let r = 0; r < matrix.length; r++) {
      html += "<tr>";
      for (let c = 0; c < matrix[r].length; c++) {
        html += `
        <td>${matrix[r][c].toFixed(4)}</td>
      `;
      }
      html += "</tr>";
    }

    html += "</table>";
    html += `<hr />`;

    resultsDiv.innerHTML += html;
  };

  const swapRows = (row1, row2) => {
    [matrix[row1], matrix[row2]] = [matrix[row2], matrix[row1]];
    printStep(`R${row1 + 1} <==> R${row2 + 1}`);
    printMatrix(matrix);
  };

  const multiplyRow = (row, factor) => {
    for (let c = 0; c <= v; c++) {
      matrix[row][c] *= 1 / factor;
    }
    printStep(
      ` <sup>1</sup> / <sub>${factor}</sub> R${row + 1} => R${row + 1}`
    );
    printMatrix(matrix);
  };

  const addRows = (target, source, factor) => {
    for (let c = 0; c <= v; c++) {
      matrix[target][c] += factor * matrix[source][c];
    }
    printStep(`${factor} * R${source + 1} + R${target + 1} => R${target + 1}`);
    printMatrix(matrix);
  };

  const finalUniqueSolution = (print) => {
    for (let i = n - 1; i >= 0; i--) {
      for (let j = i - 1; j >= 0; j--) {
        if (Math.abs(matrix[i][i]) > 1e-9) {
          const factor = -matrix[j][i] / matrix[i][i];
          if (print) {
            addRows(j, i, factor);
          } else {
            for (let c = 0; c <= v; c++) {
              matrix[j][c] += factor * matrix[i][c];
            }
          }
        }
      }
    }
  };

  try {
    for (let leading = 0; leading < Math.min(n, v); leading++) {
      if (Math.abs(matrix[leading][leading]) < 1e-9) {
        let found = false;
        for (let j = leading + 1; j < n; j++) {
          if (Math.abs(matrix[j][leading]) > 1e-9) {
            swapRows(leading, j);
            found = true;
            break;
          }
        }
        if (!found) continue;
      }

      const leadingValue = matrix[leading][leading];
      if (Math.abs(leadingValue - 1) > 1e-9) {
        multiplyRow(leading, leadingValue);
      }

      for (let j = leading + 1; j < n; j++) {
        const factor = -matrix[j][leading];
        if (Math.abs(factor) > 1e-9) {
          addRows(j, leading, factor);
        }
      }
    }

    let rankA = 0,
      rankAug = 0;
    for (let i = 0; i < n; i++) {
      const zeroRowCoeffs = matrix[i]
        .slice(0, v)
        .every((x) => Math.abs(x) < 1e-9);
      const zeroRowAll = matrix[i].every((x) => Math.abs(x) < 1e-9);
      if (!zeroRowCoeffs) rankA++;
      if (!zeroRowAll) rankAug++;
    }

    if (rankA < rankAug) {
      resultsDiv.innerHTML += `<h3>❌ No Solution (System is inconsistent)</h3>`;
      return;
    }

    if (rankA < v) {
      resultsDiv.innerHTML += `<h3>∞ Infinite Solutions</h3>`;
      return;
    }

    function printLinearEquation() {
      let html = "";
      html += "<h3>Linear equations: </h3>";
      for (let r = 0; r < n; r++) {
        html += "<p>";
        for (let c = 0; c < v + 1; c++) {
          if (matrix[r][c] != 0) {
            if (c != v) {
              html += `${Math.abs(matrix[r][c])}X<sub>${c + 1}</sub>`;
              html += c != v - 1 ? (matrix[r][c] < 0 ? " - " : " + ") : " = ";
            } else {
              html += `${matrix[r][c]}`;
            }
          }
        }
        html += "</p>";
      }
      html += `<hr style="border: 2px solid #333" />`;
      resultsDiv.innerHTML += html;
    }

    if (method === "gaussian") {
      printLinearEquation();
      finalUniqueSolution(false);
    } else {
      finalUniqueSolution(true);
    }

    let solutionHTML = `<h3>✅ Unique Solution</h3>`;
    for (let i = 0; i < v; i++) {
      solutionHTML += `<p>x<sub>${i + 1}</sub> = ${matrix[i][v].toFixed(
        4
      )}</p>`;
    }
    resultsDiv.innerHTML += solutionHTML;
  } catch (error) {
    resultsDiv.innerHTML += `<p style="color: red;">Error: ${error.message}</p>`;
  }
}
