import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';


//className="square"
function Square(props) {
  return (
      <button className="button-57" onClick={props.onClick}>
        {props.value}
        <span>X</span>
      </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null)
        }
      ],
      stepNumber: 0,
      xIsNext: true,
      rewardTable: {}
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? "X" : "O";

    this.setState({
      history: history.concat([
        {
          squares: squares
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });

    if (this.state.xIsNext && !calculateWinner(squares)) {
      setTimeout(() => {
        this.makeComputerMove(squares);
      }, 2000);
    }
  }

  makeComputerMove(squares) {
    let emptySquares = [];
    for (let j = 0; j < squares.length; j++) {
      if (!squares[j]) {
        emptySquares.push(j);
      }
    }

    // Check for potential winning moves for the computer and make the move
    for (let move of emptySquares) {
      const newSquares = squares.slice();
      newSquares[move] = "O";
      if (calculateWinner(newSquares) === "O") {
        squares[move] = "O";
        this.setState({
          history: this.state.history.concat([
            {
              squares: squares
            }
          ]),
          stepNumber: this.state.history.length,
          xIsNext: !this.state.xIsNext
        });
        return;
      }
    }

    // Check for potential winning moves for the player and block them
    for (let move of emptySquares) {
      const newSquares = squares.slice();
      newSquares[move] = "X";
      if (calculateWinner(newSquares) === "X") {
        squares[move] = "O";
        this.setState({
          history: this.state.history.concat([
            {
              squares: squares
            }
          ]),
          stepNumber: this.state.history.length,
          xIsNext: !this.state.xIsNext
        });
        return;
      }
    }

    let bestMove = emptySquares[0];
    let bestReward = -Infinity;
    for (let move of emptySquares) {
      const newSquares = squares.slice();
      newSquares[move] = "O";
      const reward = this.state.rewardTable[newSquares.join("")] || 0;
      if (reward > bestReward) {
        bestReward = reward;
        bestMove = move;
      }
    }

    squares[bestMove] = "O";

    this.setState({
      history: this.state.history.concat([
        {
          squares: squares
        }
      ]),
      stepNumber: this.state.history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  updateRewardTable(winner) {
    const history = this.state.history;
    const reward = winner === "O" ? 1 : winner === "X" ? -1 : 0;
    for (let step of history) {
      const squares = step.squares.join("");
      if (!this.state.rewardTable[squares]) {
        this.state.rewardTable[squares] = 0;
      }
      this.state.rewardTable[squares] += reward;
    }
  }

  restartGame() {
    const winner = calculateWinner(this.state.history[this.state.history.length - 1].squares);
    this.updateRewardTable(winner);

    const nextPlayer = winner ? (winner === "O" ? "O" : "X") : (this.state.xIsNext ? "X" : "O");
    this.setState({
      history: [
        {
          squares: Array(9).fill(null)
        }
      ],
      stepNumber: 0,
      xIsNext: nextPlayer === "X"
    });
    if (nextPlayer === "O") {
      setTimeout(() => {
        this.makeComputerMove(Array(9).fill(null));
      }, 1000);
    }
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
          'Go to move #' + move :
          'Go to game start';
      return (
          <li key={move}>
            <button className="button-89" onClick={() => this.jumpTo(move)}>{desc}</button>
          </li>
      );
    });

    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
        <div className="game">
          <div className="game-board">
            <Board
                squares={current.squares}
                onClick={(i) => this.handleClick(i)}
            />
          </div>
          <div className="game-info">
            <div className="status">{status}</div>
            <button className="button-50" onClick={() => this.restartGame()}>Rejouer</button>
            <ol>{moves}</ol>
          </div>
        </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
