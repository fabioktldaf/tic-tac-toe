// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

contract TicTacToe {
    enum MoveType {
        N,
        x,
        o
    }

    struct Game {
        MoveType[9] squares; // x | o | N
        address status; // 0 running | 1 tie | winner address
        address player1; // x
        address player2; // o
        uint256 prize;
        MoveType nextMoveTo; // x | o | N
    }

    mapping(uint256 => Game) public games;
    uint256 public gamesCounter = 0;

    modifier onlyActiveGame(uint256 _gameId) {
        require(
            games[_gameId].player1 != address(0) &&
                games[_gameId].status == address(0),
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

    function startNewGame() external payable {
        require(msg.value > 0, "you have to send some ETH for the prize");

        gamesCounter++;
        address addrZero = address(0);

        games[gamesCounter] = Game(
            [
                MoveType.N,
                MoveType.N,
                MoveType.N,
                MoveType.N,
                MoveType.N,
                MoveType.N,
                MoveType.N,
                MoveType.N,
                MoveType.N
            ],
            addrZero,
            msg.sender,
            addrZero,
            msg.value,
            MoveType.x
        );

        emit GameCreated(msg.sender, gamesCounter);
    }

    function getGame(uint256 _gameId) external view returns (Game memory) {
        return games[_gameId];
    }

    function joinGame(uint256 _gameId)
        external
        payable
        onlyActiveGame(_gameId)
    {
        Game storage game = games[_gameId];

        require(msg.sender != game.player1, "you can't join this game");
        require(
            msg.value >= game.prize,
            "the sent value is insuficient for this game"
        );

        game.player2 = msg.sender;
        game.prize += msg.value;

        emit OpponentJoinedGame(msg.sender, _gameId);
    }

    function makeMove(uint256 _gameId, uint8 _move)
        public
        onlyActiveGame(_gameId)
        onlyPlayers(_gameId)
    {
        Game storage game = games[_gameId];

        MoveType senderMoveType = msg.sender == game.player1
            ? MoveType.x
            : MoveType.o;

        require(senderMoveType == game.nextMoveTo, "it's not your turn");
        require(
            game.squares[_move] == MoveType.N,
            "this cell is already taken"
        );

        game.squares[_move] = game.nextMoveTo;

        updateGameStatus(game, game.nextMoveTo);

        game.nextMoveTo = game.nextMoveTo == MoveType.o
            ? MoveType.x
            : MoveType.o;

        if (game.status == game.player1) {
            payable(game.player1).transfer(game.prize);
        } else if (game.status == game.player2) {
            payable(game.player2).transfer(game.prize);
        }

        emit MoveMade(msg.sender, _gameId);
    }

    function updateGameStatus(Game storage _game, MoveType _playerMove)
        private
    {
        MoveType[9] memory squares = _game.squares;

        if (
            (squares[0] == _playerMove &&
                squares[1] == _playerMove &&
                squares[2] == _playerMove) ||
            (squares[3] == _playerMove &&
                squares[4] == _playerMove &&
                squares[5] == _playerMove) ||
            (squares[6] == _playerMove &&
                squares[7] == _playerMove &&
                squares[8] == _playerMove) ||
            (squares[0] == _playerMove &&
                squares[3] == _playerMove &&
                squares[6] == _playerMove) ||
            (squares[1] == _playerMove &&
                squares[4] == _playerMove &&
                squares[7] == _playerMove) ||
            (squares[2] == _playerMove &&
                squares[5] == _playerMove &&
                squares[8] == _playerMove) ||
            (squares[0] == _playerMove &&
                squares[4] == _playerMove &&
                squares[8] == _playerMove) ||
            (squares[2] == _playerMove &&
                squares[4] == _playerMove &&
                squares[6] == _playerMove)
        ) {
            _game.status = _playerMove == MoveType.x
                ? _game.player1
                : _game.player2;
        } else {
            uint256 freeCell = 0;
            for (uint256 i = 0; i < 9; i++) {
                if (squares[i] == MoveType.N) freeCell++;
            }

            if (freeCell == 0) {
                _game.status = address(1);
            }
        }
    }
}
