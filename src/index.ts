import {Game} from "./game/Game";

const game = new Game();

game.run().then(() => {
    game.loop();
});
