var ctx = document.getElementById("myCanvas").getContext("2d");
var pointSize = 30;
var length = 18
var snake = [{
    x: 10,
    y: 9
}, {
    x: 10,
    y: 8
}, {
    x: 10,
    y: 7
}, {
    x: 10,
    y: 6
}, {
    x: 10,
    y: 5
}];
var flood = null;
var grid = null;
var drop = null
var score = document.getElementById("score");
var dead = document.getElementById("dead");
ctx.shadowBlur = 2;
ctx.shadowColor = "white";
var id = null
main()

function init() {
    window.clearInterval(id)
    ctx.clearRect(0, 0, pointSize * length, pointSize * length);
    snake = [{
        x: 10,
        y: 9
    }, {
        x: 10,
        y: 8
    }];
    flood = null;
    dead.innerHTML = '';
}

function startComputerGame() {
    init();
    main()
}

function main() {
    try {
        genFood()
        id = setInterval(moveSnake, 100);
    } catch (err) {
        console.log('err ', err.stack)
        window.clearInterval(id);
        dead.innerHTML = '挂啦';
    }
}

function isGameOver(head) {
    if (hitSnake(head, 0)) {
        return true;
    }
    if (head.x < 0 || head.x >= length || head.y < 0 || head.y >= length) {
        return true;
    }
    return false
}
var drawSnake = function () {
    ctx.clearRect(0, 0, pointSize * length, pointSize * length);
    if (flood) {
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(flood.x * pointSize, flood.y * pointSize, pointSize, pointSize);
        ctx.fillStyle = "#000000";
    }
    ctx.fillStyle = "#006600";
    ctx.fillRect(snake[0].x * pointSize, snake[0].y * pointSize, pointSize, pointSize);
    ctx.fillStyle = "#000000";
    for (var i = 1; i < snake.length - 1; i++) {
        ctx.fillRect(snake[i].x * pointSize, snake[i].y * pointSize, pointSize, pointSize);
    }
    ctx.fillStyle = "#ffff00";
    ctx.fillRect(snake[snake.length - 1].x * pointSize, snake[snake.length - 1].y * pointSize, pointSize,
        pointSize);
    ctx.fillStyle = "#000000";
};

function drawPaths() {
    console.log('drawPaths', paths.length);
    ctx.fillStyle = "#0000ff";
    for (var i = 0; i < paths.length - 1; i++)
        ctx.fillRect(paths[i][0] * pointSize, paths[i][1] * pointSize, pointSize, pointSize);
    ctx.fillStyle = "#000000";
}

function nodeEqual(nodeA, nodeB) {
    return nodeA.x === nodeB.x &&
        nodeA.y === nodeB.y
}

function genFood() {
    while (flood == null || hitSnake(flood))
        flood = {
            y: (Math.random() * length >>> 0),
            x: (Math.random() * length >>> 0)
        };
}

function moveSnake() {
    try {
        var next = getNext()
        if (!next) return
        if (nodeEqual(next, flood || {})) {
            snake.unshift(flood)
            flood = null
            genFood()
        } else {
            snake.unshift(next)
            drop = snake.pop();
        }
        drawSnake();
        score.innerHTML = snake.length;
        if (isGameOver(snake[0])) {
            window.clearInterval(id);
            dead.innerHTML = '你太菜啦';
            return;
        }
    } catch (err) {
        console.log('err ', err.stack)
        window.clearInterval(id);
        dead.innerHTML = '死翘翘喽';
    }

}
function hitSnake(flood, j) {
    for (var i = 0; i < snake.length; i++)
        if (j != i && nodeEqual(snake[i], flood))
            return true;
    return false;
}
var paths = []
function getNext() {
    if (paths.length === 0) {
        paths = genPaths()
        paths.shift()
    }
    if (flow_tail) {
        paths = genPaths()
        paths.shift()
    }
    var n = paths.shift()
    if (!n) {
        window.clearInterval(id);
        dead.innerHTML = '无路可走';
        return null;
    }
    return {
        x: n[0],
        y: n[1]
    };
}
var flow_tail = false

function genPaths() {
    var find = getAstarPath(snake[0], flood)
    if (find.length <= 2) {
        flow_tail = true
        return getAstarPath(snake[0], drop, true)
    }
    var find2 = genNextPaths(find)
    if (find2.length <= 2) {
        flow_tail = true
        return getAstarPath(snake[0], drop, true)
    } else {
        flow_tail = false
        return find
    }
}


function getAstarPath(start, end) {
    var path = AStar(initGrid(snake), [start.x, start.y], [end.x, end.y], "Manhattan")
    return path
}
function genNextPaths(temp_paths) {
    var fakeSnake = snake.concat([])
    for (var i = 1; i < temp_paths.length; i++) {
        fakeSnake.unshift({
            x: temp_paths[i][0],
            y: temp_paths[i][1]
        })
    }
    fakeSnake = fakeSnake.slice(0, snake.length + 2)
    var end = fakeSnake.pop()
    return AStar(initGrid(fakeSnake), [fakeSnake[0].x, fakeSnake[0].y], [end.x, end.y], "Manhattan")
}

function initGrid(tempSnake) {
    var grid = []
    for (var i = 0; i < length; i++) {
        grid[i] = new Array(length);
        for (var j = 0; j < length; j++) {
            grid[i][j] = 0
        }
    }
    for (var i = 1; i < tempSnake.length; i++) {

        grid[tempSnake[i].y][tempSnake[i].x] = 1
    }
    return grid
}