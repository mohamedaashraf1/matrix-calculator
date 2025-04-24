document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("button[data-operation]").forEach((button) => {
    button.addEventListener("click", () =>
      performOperation(button.getAttribute("data-operation"))
    );
  });
});

if (typeof math === "undefined") {
  console.error("Math.js is not loaded!");
} else {
  console.log("Math.js is loaded successfully");
}

function createMatrix(containerId, rowsId, colsId) {
  let rows = parseInt(document.getElementById(rowsId).value) || 0;
  let cols = parseInt(document.getElementById(colsId).value) || 0;

  if (rows > 4 || cols > 4) {
    displayError("⚠️ Maximum matrix size is 4×4.", "softYellow");
    return;
  }

  const container = document.getElementById(containerId);
  container.innerHTML = "";

  let table = document.createElement("table");

  for (let i = 0; i < rows; i++) {
    let row = document.createElement("tr");

    for (let j = 0; j < cols; j++) {
      let cell = document.createElement("td");
      let input = document.createElement("input");
      input.type = "number";
      input.className = "matrix-input";
      input.dataset.row = i;
      input.dataset.col = j;
      cell.appendChild(input);
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
  container.appendChild(table);
}

function getMatrix(containerId) {
  let inputs = document.querySelectorAll(`#${containerId} .matrix-input`);
  if (inputs.length === 0) {
    displayError("❌ No matrix found. Please create one first.");
    return null;
  }

  try {
    return Array.from(inputs).reduce((matrix, input) => {
      let row = parseInt(input.dataset.row);

      let col = parseInt(input.dataset.col);

      if (!matrix[row]) matrix[row] = [];

      let value = parseFloat(input.value);

      if (isNaN(value)) throw new Error("❌ All fields must contain numbers.");

      matrix[row][col] = value;

      return matrix;
    }, []);
  } catch (error) {
    displayError(error.message);

    return null;
  }
}

function performOperation(operation) {
  try {
    let matrixA = getMatrix("matrix1-container");
    let matrixB = ["add", "subtract", "multiply"].includes(operation)
      ? getMatrix("matrix2-container")
      : null;

    if (!matrixA)
      throw new Error(
        "❌ Please create a matrix before performing this operation."
      );
    if (
      matrixB === null &&
      ["add", "subtract", "multiply"].includes(operation)
    ) {
      throw new Error(
        `❌ Matrix B is missing. Please create and fill Matrix B.`
      );
    }

    let result;
    switch (operation) {
      case "add":
        result = math.add(matrixA, matrixB);
        break;
      case "subtract":
        result = math.subtract(matrixA, matrixB);
        break;
      case "multiply":
        result = math.multiply(matrixA, matrixB);
        break;
      case "inverse":
        if (matrixA.length !== matrixA[0].length)
          throw new Error("❌ Only square matrices can be inverted.");
        result = math.inv(matrixA);
        break;
      case "transpose":
        result = math.transpose(matrixA);
        break;
      default:
        throw new Error("❌ Unknown operation.");
    }

    displayResult(result);
  } catch (error) {
    displayError(error.message);
  }
}

function addMatrices(matrixA, matrixB) {
  let result = [];

  for (let i = 0; i < matrixA.length; i++) {
    result[i] = [];

    for (let j = 0; j < matrixA[i].length; j++) {
      result[i][j] = matrixA[i][j] + matrixB[i][j];
    }
  }

  return result;
}

function subtractMatrices(matrixA, matrixB) {
  let result = [];

  for (let i = 0; i < matrixA.length; i++) {
    result[i] = [];

    for (let j = 0; j < matrixA[i].length; j++) {
      result[i][j] = matrixA[i][j] - matrixB[i][j];
    }
  }

  return result;
}

function multiplyMatrices(matrixA, matrixB) {
  let result = [];

  for (let i = 0; i < matrixA.length; i++) {
    result[i] = [];

    for (let j = 0; j < matrixB[0].length; j++) {
      result[i][j] = 0;

      for (let k = 0; k < matrixA[i].length; k++) {
        result[i][j] += matrixA[i][k] * matrixB[k][j];
      }
    }
  }

  return result;
}

function transposeMatrices(matrixA) {
  let result = [];

  for (let i = 0; i < matrixA[0].length; i++) {
    result[i] = [];

    for (let j = 0; j < matrixA.length; j++) {
      result[i][j] = matrixA[j][i];
    }
  }

  return result;
}

function inverseMatrices(matrixA) {
  let n = matrixA.length;

  let identity = [];

  for (let i = 0; i < n; i++) {
    identity[i] = [];

    for (let j = 0; j < n; j++) {
      identity[i][j] = i === j ? 1 : 0;
    }
  }

  for (let i = 0; i < n; i++) {
    let factor = matrixA[i][i];

    if (factor === 0) {
      for (let j = i + 1; j < n; j++) {
        if (matrixA[j][i] !== 0) {
          [matrixA[i], matrixA[j]] = [matrixA[j], matrixA[i]];
          [identity[i], identity[j]] = [identity[j], identity[i]];

          factor = matrixA[i][i];

          break;
        }
      }
    }

    if (factor === 0)
      throw new Error("❌ Matrix is singular and cannot be inverted.");

    for (let j = 0; j < n; j++) {
      matrixA[i][j] /= factor;
      identity[i][j] /= factor;
    }

    for (let j = 0; j < n; j++) {
      if (j !== i) {
        let factor2 = matrixA[j][i];

        for (let k = 0; k < n; k++) {
          matrixA[j][k] -= factor2 * matrixA[i][k];
          identity[j][k] -= factor2 * identity[i][k];
        }
      }
    }
  }

  return identity;
}

function displayResult(matrix) {
  let resultDiv = document.getElementById("result");
  resultDiv.innerHTML = formatMatrix(matrix);
  resultDiv.classList.add("show");
  resultDiv.style.display = "block";
}

function formatMatrix(matrix) {
  return Array.isArray(matrix) && Array.isArray(matrix[0])
    ? `<table>${matrix
        .map(
          (row) =>
            `<tr>${row
              .map((val) => `<td>${val.toFixed(2)}</td>`)
              .join("")}</tr>`
        )
        .join("")}</table>`
    : Array.isArray(matrix)
    ? `<p>Solution: ${matrix
        .map((x, i) => `x${i + 1} = ${x.toFixed(2)}`)
        .join(", ")}</p>`
    : `<p>${matrix}</p>`;
}

function displayError(message, type = "error") {
  let resultDiv = document.getElementById("result");

  let colors = { error: "#ff4c4c", softYellow: "#e6c200" };

  resultDiv.innerHTML = `<p style="color: ${colors[type]}; font-weight: bold;">${message}</p>`;

  resultDiv.style.display = "block";

  resultDiv.classList.add("show");
}

function hideError() {
  let resultDiv = document.getElementById("result");
  resultDiv.style.display = "none";
  resultDiv.classList.remove("show");
}
