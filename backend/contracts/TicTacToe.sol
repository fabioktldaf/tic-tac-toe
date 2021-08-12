// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

contract TicTacToe {
    enum GameStatus {
        Playable,
        EndedWithWinner,
        EndedWithTie
    }

    struct Game {
        uint8[9] squares; // 1 | 2 | 0
        address player1; // x - who create the game is always player 1
        address player2; // o
        address nextMovePlayer;
        address winner; // player 1 | player 2
        GameStatus status;
    }

    mapping(uint256 => Game) public games;

    uint256 public gamesCounter = 0;

    modifier onlyActiveGame(uint256 _gameId) {
        require(
            games[_gameId].status == GameStatus.Playable,
            "you can't play this game"
        );
        _;
    }

    modifier onlyPlayers(uint256 _gameId) {
        Game storage game = games[_gameId];
        require(
            game.player1 == msg.sender || game.player2 == msg.sender,
            "you are not a player of this game"
        );
        _;
    }

    event GameCreated(address indexed sender, uint256 indexed gameId);
    event OpponentJoinedGame(address indexed sender, uint256 indexed gameId);
    event MoveMade(address indexed sender, uint256 indexed gameId);

    function startNewGame() external {
        gamesCounter++;
        address addrZero = address(0);

        games[gamesCounter] = Game(
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            msg.sender,
            addrZero,
            msg.sender,
            addrZero,
            GameStatus.Playable
        );

        emit GameCreated(msg.sender, gamesCounter);
    }

    function getGame(uint256 _gameId) external view returns (Game memory) {
        return games[_gameId];
    }

    function joinGame(uint256 _gameId) external onlyActiveGame(_gameId) {
        Game storage game = games[_gameId];

        require(msg.sender != game.player1, "you can't join this game");

        game.player2 = msg.sender;
        if (game.nextMovePlayer == address(0)) {
            game.nextMovePlayer = msg.sender;
        }

        emit OpponentJoinedGame(msg.sender, _gameId);
    }

    function makeMove(uint256 _gameId, uint8 _move)
        public
        onlyActiveGame(_gameId)
        onlyPlayers(_gameId)
    {
        Game storage game = games[_gameId];

        require(game.nextMovePlayer == msg.sender, "it's not your turn");
        require(game.squares[_move] == 0, "this cell is already taken");

        game.squares[_move] = msg.sender == game.player1 ? 1 : 2;

        updateGameStatus(game);

        game.nextMovePlayer = game.nextMovePlayer == game.player1
            ? game.player2
            : game.player1;

        emit MoveMade(msg.sender, _gameId);
    }

    function updateGameStatus(Game storage _game) private {
        uint8[9] storage squares = _game.squares;
        uint8 val = msg.sender == _game.player1 ? 1 : 2;

        if (
            (squares[0] == val && squares[1] == val && squares[2] == val) ||
            (squares[3] == val && squares[4] == val && squares[5] == val) ||
            (squares[6] == val && squares[7] == val && squares[8] == val) ||
            (squares[0] == val && squares[3] == val && squares[6] == val) ||
            (squares[1] == val && squares[4] == val && squares[7] == val) ||
            (squares[2] == val && squares[5] == val && squares[8] == val) ||
            (squares[0] == val && squares[4] == val && squares[8] == val) ||
            (squares[2] == val && squares[4] == val && squares[6] == val)
        ) {
            // we have a winner
            _game.winner = msg.sender;
            _game.nextMovePlayer = address(0);
            _game.status = GameStatus.EndedWithWinner;
        } else {
            for (uint256 i = 0; i < 9; i++) {
                if (squares[i] == 0) {
                    return; // we have at least another available move
                }
            }
            // it'a a tie
            _game.winner = address(0);
            _game.nextMovePlayer = address(0);
            _game.status = GameStatus.EndedWithTie;
        }
    }
}
