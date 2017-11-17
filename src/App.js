import React, {Component} from 'react';
import './App.css';

let data = {
    "inputs": [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
    ]
};

class DataStore {

    constructor(data) {
        //store that data in the object
        this.data = data;

        //empty array for our watchers
        //watchers are objects that want to be informed about when the data changes
        this.registeredWatchers = [];
    }

    //add a new watcher (component) to the list
    register(watcher) {
        this.registeredWatchers.push(watcher);
    }

    setInput(newInputState, row, col) {
        //make sure the selected input box is empty
        if (this.data[row][col] === "") {
            //if empty, update data with user input
            this.data[row][col] = newInputState;

            //inform all watching objects (in this case, App and Grid components)..
            this.registeredWatchers.map((watcher) => {
                watcher.dataUpdated();
            });
        } else {
            return false;
        }
    }

    switchPlayer(currentPlayer) {
        //validate that currentPlayer is either x or o
        if (currentPlayer === "x" || currentPlayer === "o") {
            //dispatch the currentPlayer to the switchPlayer() method in Grid & App component (the watchers) for data consistency
            this.registeredWatchers.map((watcher) => {
                watcher.switchPlayer(currentPlayer);
            })
        }
    }

    winner(player) {
        if (player === "x" || player === "o" || player === "tie" || player === "takenSpace") {
            //dispatch the winning player to the winner() method in App component (one of the watchers)
            // this.registeredWatchers.map((watcher) => {
            //     watcher.winner(player);
            // })
            this.registeredWatchers[0].winner(player);
        }
    }

    resetGame(action) {
        if (action) {
            // this.data = [
            //     ["", "", ""],
            //     ["", "", ""],
            //     ["", "", ""]
            // ];
            //
            // //dispatch commanding action to App component
            // this.registeredWatchers.map((watcher) => {
            //     watcher.resetGame(this.data)
            // });
        }
    }
}

class Dispatcher {

    constructor() {
        this.registeredHandlers = []; //D:
    }

    register(callback) {
        this.registeredHandlers.push(callback);
    }

    dispatch(action) {
        //call every method in our registered handlers array
        //with this action as an input
        this.registeredHandlers.map((handler) => {
            //call that individual function in the array..
            handler(action);
        });
    }
}

class Box extends Component {

    render() {
        return (
            <div className="box"
                 onClick={this.handleClick.bind(this)}>
                {this.props.input}
            </div>
        )
    }

    handleClick() {
        //try a test dispatch
        if (this.props.turn === "x" && this.props.input === "") {
            inputDispatcher.dispatch({type: "play", player: "x", playerMove: "x", row: this.props.rowNum, col: this.props.colNum,});
            // this.props.turn = "o";
        } else if (this.props.turn === "o" && this.props.input === "") {
            inputDispatcher.dispatch({type: "play", player: "o", playerMove: "o", row: this.props.rowNum, col: this.props.colNum,});
            // this.props.turn = "x";
        } else if (this.props.input !== "") {
            inputDispatcher.dispatch({type: "takenSpace"});
        }
    }
}

class Grid extends Component {
    constructor(props) {
        //make sure this stays a react component
        super(props);

        this.state = {
            inputs: this.props.inputs,
            turn: "x"
        };

        //ensure we're listening to the data store and adding grid as a watcher
        inputDataStore.register(this);
    }

    dataUpdated() {
            this.setState({
                inputs: inputDataStore.data
            })
    }

    switchPlayer(currentPlayer) {
        if (currentPlayer === "x" && this.state.turn === "x") {
            this.setState({
                turn: "o"
            })
        } else if (currentPlayer === "o" && this.state.turn === "o") {
            this.setState({
                turn: "x"
            })
        }
    }

    resetGame(data) {
        //doesn't work properly?
        // this.setState({
        //     inputs: data,
        //     turn: "x"
        // })
    }

    render() {
        return (
            <div>
                {
                    //data.inputs.map((row, rowNum) => {}
                    this.state.inputs.map((row, rowNum) => {
                        return (
                            <div className="row">
                                {
                                    row.map((input, colNum) => {
                                        return <Box input={input} rowNum={rowNum} colNum={colNum} turn={this.state.turn}/>
                                    })
                                }
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}

class App extends Component {
    constructor(props) {
        //make sure this stays a react component
        super(props);

        this.state = {
            inputs: data.inputs,
            currentPlayer: "x",
            winner: "",
            takenSpace: false
        };

        //ensure we're listening to the data store and adding App component as a watcher
        inputDataStore.register(this);
    }

    dataUpdated() {
        this.setState({
            inputs: inputDataStore.data
        })
    }

    switchPlayer(currentPlayer) {
        if (currentPlayer === "x" && this.state.currentPlayer === "x") {
            this.setState({
                currentPlayer: "o",
                takenSpace: false
            })
        } else if (currentPlayer === "o" && this.state.currentPlayer === "o") {
            this.setState({
                currentPlayer: "x",
                takenSpace: false
            })
        }
    }

    winner(player) {
        if (player === "x") {
            this.setState({
                winner: "x",
                currentPlayer: false,
                takenSpace: false
            })
        } else if (player === "o") {
            this.setState({
                winner: "o",
                currentPlayer: false,
                takenSpace: false
            })
        } else if (player === "tie") {
            this.setState({
                winner: "tie",
                currentPlayer: false,
                takenSpace: false
            })
        } else if (player === "takenSpace") {
            this.setState({
                takenSpace: true
            })
        }
    }

    resetGame(data) {
        if (data) {
            //doesn't work properly??
            // this.setState({
            //     inputs: data,
            //     currentPlayer: "x",
            //     winner: "",
            //     takenSpace: false
            // })
        }
    }

    render() {
        return (
            <div>
                <h1>Tic Tac Toe</h1>
                <Grid inputs={this.state.inputs} />
                {this.renderText()}
                <button onClick={this.handleClick.bind(this)}>Reset</button>
            </div>
        )
    }

    renderText() {
        if (this.state.winner === "" && this.state.takenSpace === false) {
            return (<p>It is now player {this.state.currentPlayer}'s turn.</p>)
        } else if ((this.state.winner === "x" || this.state.winner === "o") && this.state.takenSpace === false) {
            return (<p>Player {this.state.winner} is the winner.</p>)
        } else if (this.state.winner === "tie" && this.state.takenSpace === false) {
            return (<p>The match ended in a {this.state.winner}.</p>)
        } else if (this.state.takenSpace === true) {
            return (<p>Don't select a space that is being used.</p>)
        }
    }

    handleClick() {
        inputDispatcher.dispatch({type: "resetGame"});
    }
}

//start of app
let inputDispatcher = new Dispatcher();
let inputDataStore = new DataStore(data.inputs);

inputDispatcher.register((action) => {
    if (action.type === "play") {
        //actually want to handle it
        inputDataStore.setInput(action.playerMove, action.row, action.col);
        //data.crops[action.row][action.col] = " ";

        if (data.inputs[0][0] === action.playerMove &&
            data.inputs[0][1] === action.playerMove &&
            data.inputs[0][2] === action.playerMove) {
            inputDataStore.winner(action.player);
        } else
        if (data.inputs[0][0] === action.playerMove &&
            data.inputs[1][1] === action.playerMove &&
            data.inputs[2][2] === action.playerMove) {
            inputDataStore.winner(action.player);
        } else
        if (data.inputs[0][0] === action.playerMove &&
            data.inputs[1][0] === action.playerMove &&
            data.inputs[2][0] === action.playerMove) {
            inputDataStore.winner(action.player);
        } else
        if (data.inputs[0][1] === action.playerMove &&
            data.inputs[1][1] === action.playerMove &&
            data.inputs[2][1] === action.playerMove) {
            inputDataStore.winner(action.player);
        } else
        if (data.inputs[0][2] === action.playerMove &&
            data.inputs[1][2] === action.playerMove &&
            data.inputs[2][2] === action.playerMove) {
            inputDataStore.winner(action.player);
        }  else
        if (data.inputs[0][2] === action.playerMove &&
            data.inputs[1][1] === action.playerMove &&
            data.inputs[2][0] === action.playerMove) {
            inputDataStore.winner(action.player);
        }  else
        if (data.inputs[1][0] === action.playerMove &&
            data.inputs[1][1] === action.playerMove &&
            data.inputs[1][2] === action.playerMove) {
            inputDataStore.winner(action.player);
        } else
        if (data.inputs[2][0] === action.playerMove &&
            data.inputs[2][1] === action.playerMove &&
            data.inputs[2][2] === action.playerMove) {
            inputDataStore.winner(action.player);
        } else
        if (data.inputs[0][0] !== "" &&
            data.inputs[0][1] !== "" &&
            data.inputs[0][2] !== "" &&
            data.inputs[1][0] !== "" &&
            data.inputs[1][1] !== "" &&
            data.inputs[1][2] !== "" &&
            data.inputs[2][0] !== "" &&
            data.inputs[2][1] !== "" &&
            data.inputs[2][2] !== "") {
            inputDataStore.winner("tie");
        }

        inputDataStore.switchPlayer(action.player);

    } else if (action.type === "takenSpace") {
        inputDataStore.winner(action.type);
    } else if (action.type === "resetGame") {
        inputDataStore.resetGame(action.type);
    }
});

export default App;
