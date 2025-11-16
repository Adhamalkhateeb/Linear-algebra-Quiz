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
  let matrix = Array.from({ length: n }, () => Array(v + 1).fill(0));

  for (let r = 0; r < n; r++) {
    for (let c = 0; c <= v; c++) {
      matrix[r][c] = parseFloat(
        document.getElementById(`cell-${r}-${c}`).value || 0
      );
    }
  }

  function swapRows(row1, row2) {
    [matrix[row1], matrix[row2]] = [matrix[row2], matrix[row1]];
  }

  function multiplyRow(row, factor) {
    for (let c = 0; c <= v; c++) {
      matrix[row][c] *= factor;
    }
  }

  function addRows(target, source, factor) {
    for (let c = 0; c <= v; c++) {
      matrix[target][c] += factor * matrix[source][c];
    }
  }

  for (let row = 0; row < n; row++) {
    if (Math.abs(matrix[row][row]) < 1e-9) {
      for (let j = row + 1; j < n; j++) {
        if (Math.abs(matrix[j][row]) > 1e-9) {
          swapRows(row, j);
          break;
        }
      }
    }

    if (Math.abs(matrix[row][row]) > 1e-9) {
      const pivot = matrix[row][row];
      if (Math.abs(pivot - 1) > 1e-9) {
        multiplyRow(row, 1 / pivot);
      }
    }

    for (let j = row + 1; j < n; j++) {
      if (Math.abs(matrix[row][row]) > 1e-9) {
        const factor = -matrix[j][row];
        addRows(j, row, factor);
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

  const resultsDiv = document.getElementById("results");
  resultsDiv.style.display = "block";

  if (rankA < rankAug) {
    resultsDiv.innerHTML = `<h3>No Solution </h3>`;
    return;
  }

  if (rankA < v) {
    resultsDiv.innerHTML = `<h3>Infinite Solutions </h3>`;
    return;
  }

  for (let i = n - 1; i >= 0; i--) {
    for (let j = i - 1; j >= 0; j--) {
      if (Math.abs(matrix[i][i]) > 1e-9) {
        const factor = -matrix[j][i];
        addRows(j, i, factor);
      }
    }
  }

  let html = `<h3>Unique Solution ✅</h3>`;
  for (let i = 0; i < v; i++) {
    html += `<p>x<sub>${i + 1}</sub> = ${matrix[i][v].toFixed(4)}</p>`;
  }
  resultsDiv.innerHTML = html;
}
