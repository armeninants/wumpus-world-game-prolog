var player = new WampusWorld.PlayerInterface();
var game = new WampusWorld.Game();

player.play(game);
game.startNewGame();

console.log(game);
console.log(player);