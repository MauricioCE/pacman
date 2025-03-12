type Vector2 = {
  x: number;
  y: number;
};

type Maze = number[][];

// ===========================================================================================
// =======================================    GHOST    =======================================
// ===========================================================================================

class Ghost {
  position: Vector2;
  maze: Maze;

  constructor(initialPosition: Vector2, maze: Maze) {
    this.position = initialPosition;
    this.maze = maze;
  }

  // Roda a BFS
  findPathToPacman(pacmanPosition: Vector2) {
    return this.bfs(this.position, pacmanPosition);
  }

  // BFS para achar o menor caminho para o pacman. O caminho é uma lista de posições,
  // começando da posição atual do fantasma, indo até a posição do pacman
  bfs(start: Vector2, target: Vector2) {
    const queue: {
      pos: Vector2;
      path: Vector2[];
    }[] = [];
    // Set contendo todas as posições visitadas em formato de string
    const visited = new Set<string>();
    // Direções dos movimentos possíveis
    const directions = [
      { x: 0, y: -1 }, // cima
      { x: 1, y: 0 }, // direita
      { x: 0, y: 1 }, // baixo
      { x: -1, y: 0 }, // esquerda
    ];

    // Adicionando o "nó" inicial, onde o fantasma está à fila e já setando que a posição inicial foi visitada
    queue.push({ pos: start, path: [start] });
    visited.add(this.positionToString(start));

    while (queue.length > 0) {
      const current = queue.shift();

      if (this.isSamePosition(current!.pos, target)) {
        return current!.path;
      }

      for (const dir of directions) {
        const nextPos = {
          x: current!.pos.x + dir.x,
          y: current!.pos.y + dir.y,
        };

        const posString = this.positionToString(nextPos);

        if (this.isValidPosition(nextPos) && !visited.has(posString)) {
          visited.add(posString);
          queue.push({
            pos: nextPos,
            path: [...current!.path, nextPos],
          });
        }
      }
    }

    return [];
  }

  // Verifica se a posição está dentro dos limites do labirinto
  isValidPosition(pos: Vector2) {
    return (
      pos.x >= 0 &&
      pos.x < this.maze[0].length &&
      pos.y >= 0 &&
      pos.y < this.maze.length &&
      this.maze[pos.y][pos.x] !== 1
    );
  }

  // Verifica se duas posições são iguais
  isSamePosition(pos1: Vector2, pos2: Vector2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
  }

  // Converte uma posição Vector2 para uma string no formato x,y
  positionToString(pos: Vector2) {
    return `${pos.x},${pos.y}`;
  }

  // Move o ghost para a posição informada
  move(nextPosition: Vector2) {
    this.position = nextPosition;
  }

  // Retorna a posição atual do ghost
  getPosition() {
    return this.position;
  }
}

// ==========================================================================================
// =======================================    GAME    =======================================
// ==========================================================================================

export default class Game {
  maze: Maze;
  pacmanPos: Vector2;
  ghostPos: Vector2;
  ghost: Ghost;
  initialPath: Vector2[] = [];
  initialPathSize: number;

  constructor(maze: Maze, ghostPos: Vector2, pacmanPos: Vector2) {
    this.maze = maze;
    this.ghostPos = ghostPos;
    this.pacmanPos = pacmanPos;
    this.ghost = new Ghost(ghostPos, this.maze);
    this.initialPath = this.ghost.findPathToPacman(pacmanPos);
    this.initialPathSize = this.initialPath.length;
  }

  // Sempre que chamado, recalcula a melhor rota até o pacman e faz um movimento em direção à ele
  update() {
    const path = this.ghost.findPathToPacman(this.pacmanPos);
    this.printDetailedState(path, this.initialPath);
    if (path.length > 1) {
      this.ghost.move(path[1]);
    }
  }

  printDetailedState(path: Vector2[], initialPath: Vector2[]) {
    console.clear();
    console.log("\n=== Estado Atual do Jogo ===");

    // Imprime posições
    console.log(
      `Fantasma: (${this.ghost.getPosition().x}, ${this.ghost.getPosition().y})`
    );
    console.log(`Pac-Man: (${this.pacmanPos.x}, ${this.pacmanPos.y})`);

    // Imprime caminho encontrado
    console.log("\nMenor caminho encontrado:");
    initialPath.forEach((pos, index) => {
      let suffix = "";
      if (this.initialPathSize - path.length === index) {
        suffix = " <-";
      }
      console.log(`${index}: (${pos.x}, ${pos.y})${suffix}`);

      // console.log(path.length, index);
    });

    // Visualização do labirinto
    console.log("\nLabirinto:");

    const display = this.maze.map((row) => [...row]);

    // Marca o caminho com '*'
    path.forEach((pos) => {
      if (
        !this.isSamePosition(pos, this.ghost.getPosition()) &&
        !this.isSamePosition(pos, this.pacmanPos)
      ) {
        display[pos.y][pos.x] = 4; // 4 representa o caminho
      }
    });

    // Marca posições do fantasma e Pac-Man
    const ghostPos = this.ghost.getPosition();

    display[ghostPos.y][ghostPos.x] = 2;
    display[this.pacmanPos.y][this.pacmanPos.x] = 3;

    // Imprime o labirinto
    display.forEach((row) => {
      console.log(
        row
          .map((cell) => {
            switch (cell) {
              case 0:
                return "·"; // caminho livre
              case 1:
                return "█"; // parede
              case 2:
                return "F"; // fantasma
              case 3:
                return "P"; // Pac-Man
              case 4:
                return "*"; // caminho encontrado
              default:
                return " ";
            }
          })
          .join(" ")
      );
    });

    console.log("\nLegenda:");
    console.log("· - Caminho livre");
    console.log("█ - Parede");
    console.log("F - Fantasma");
    console.log("P - Pac-Man");
    console.log("* - Menor caminho");
    console.log("========================\n");
  }

  isSamePosition(pos1: Vector2, pos2: Vector2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
  }
}

// ==============================================================================================
// =======================================    EXECUÇÃO    =======================================
// ==============================================================================================

// Mapa do jogo
const maze = [
  [0, 0, 0, 0, 0, 0],
  [0, 1, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0],
];
1;

// Iniciando o jogo
const game = new Game(maze, { x: 5, y: 0 }, { x: 2, y: 4 });

// Debug no console
console.log("=== Simulação do Fantasma do Pac-Man ===\n");

function updateGame() {
  let ans = prompt("Aperte Cancelar para encerrar ou OK para continuar");
  console.log(ans);
  game.update();
  if (ans === null) return;
  setTimeout(() => updateGame(), 100);
}

updateGame();

// let move = 0;
// setInterval(() => {
//   game.update();
//   move++;
// }, 1000);
