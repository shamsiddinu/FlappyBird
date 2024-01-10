let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

// DOM Selectorlari
const skySelector = document.querySelector('.sky')
const birdSelector = document.querySelector('.bird');
const groundSelector = document.querySelector('.ground');
const birdImgSelector = document.querySelector('#birdImg')
const gameContainer = document.querySelector('.game');
const body = document.querySelector('body');
const obstacleContainer = document.querySelector('.obstacleContainer');
const obstacleContainer2 = document.querySelector('.obstacleContainer2')
const scoreElementSelector = document.querySelector('.score');
const gameOverScreenSelector = document.querySelector('.gameOver');
const gameOverScoreSelector = document.querySelector('.gameOverScore');
const hiscoreSelector = document.querySelector('.hiscore')
const restartMessageSelector = document.querySelector('.restartMessage')
const wingUpPath = "Images/Yellow/wing-up.png";
const wingDownPath = "Images/Yellow/wing-down.png";

const gravity = .3;
let initialBirdPosition;


window.onload = () => {
    obstacleContainer.style.bottom = parseFloat(getComputedStyle(groundSelector).height.slice(0, -2)) + 'px'
    initialBirdPosition = parseFloat(getComputedStyle(birdSelector).top)

    let game;
    body.addEventListener('click', () => {
        if (!game) game = new Game(gravity, initialBirdPosition)
        game.jump()
    })
    window.addEventListener('keyup', (e) => {
        if (!game && e.key === ' ') game = new Game(gravity, initialBirdPosition)
        if (e.key === ' ') game.jump()
    })

    class Game {
        constructor(gravity, birdTop) {
            this.gravity = gravity;
            this.birdTop = birdTop;
            this.scoreElement = scoreElementSelector;
            this.birdSpeed = 0;
            this.hiscore = 0;
            this.pull = setInterval(() => { game.pullBird() }, 20);
            this.generateObstacles = setInterval(() => { game.generateObstacle() }, 2000);
            this.moveObstacles = setInterval(() => { game.moveObstacle() }, 20);
        }

        pullBird() {
            this.birdSpeed += this.gravity
            this.updatePosition(this.birdSpeed)
            if (birdSelector.getBoundingClientRect().bottom > groundSelector.getBoundingClientRect().top) { //check if bird hits the ground
                game.gameOverScreenPopup()
            }
        }

        updatePosition(speed) {
            this.birdTop += speed;
            birdSelector.style.top = this.birdTop + 'px';
        }

        jump() {
            this.birdSpeed =  -7 //pulls bird up
            if (birdImgSelector.src.includes('wing-up.png')) {
                setTimeout(() => birdImgSelector.src = wingUpPath, 100)
            }
            
            birdImgSelector.src = wingDownPath
        }

        generateObstacle() {
            let obsHeight = Math.random() * (parseFloat(getComputedStyle(obstacleContainer).height) - 100) + 100
            let obstacle = document.createElement('div')
            obstacleContainer.appendChild(obstacle)
            obstacle.classList.add('obstacle')
            obstacle.style.height = obsHeight + 'px'

            obstacle = document.createElement('div')
            obstacleContainer2.appendChild(obstacle)
            obstacle.classList.add('obstacle', 'obstacle2')
            obsHeight = parseFloat(getComputedStyle(skySelector).height) - obsHeight - 150
            obstacle.style.height = obsHeight + 'px'
        }

        moveObstacle() {
            let obstaclesSelector = document.querySelectorAll('.obstacle')
            obstaclesSelector.forEach(obstacle => {
                let obstacleLeftPosition = parseFloat(getComputedStyle(obstacle).left.slice(0, -2))
                obstacleLeftPosition -= 3;
                obstacle.style.left = obstacleLeftPosition + 'px'

                game.checkCollision(obstacle)
                let obstacleBirdDistance = obstacle.getBoundingClientRect().left - birdSelector.getBoundingClientRect().left;
                if (obstacleBirdDistance <= 3 && obstacleBirdDistance > 0 && !obstacle.classList.contains('obstacle2')) {
                    this.updateScore();
                }
            })
        }

        checkCollision(item) {
            if (!item.classList.contains('obstacle2')) {
                if (item.getBoundingClientRect().left < birdSelector.getBoundingClientRect().right &&
                    birdSelector.getBoundingClientRect().bottom > item.getBoundingClientRect().top &&
                    birdSelector.getBoundingClientRect().left < item.getBoundingClientRect().right) {//check for collision with obstacle
                    game.gameOverScreenPopup();
                }
            }
            if (item.classList.contains('obstacle2')) {
                if (item.getBoundingClientRect().left < birdSelector.getBoundingClientRect().right &&
                    birdSelector.getBoundingClientRect().top < item.getBoundingClientRect().bottom &&
                    birdSelector.getBoundingClientRect().left < item.getBoundingClientRect().right) {
                    game.gameOverScreenPopup();
                }
            }
        }

        updateScore() {
            this.scoreElement.textContent = parseInt(this.scoreElement.textContent) + 1;
        }

        gameOverScreenPopup() {
            clearInterval(this.pull)
            clearInterval(this.generateObstacles)
            clearInterval(this.moveObstacles)
            gameOverScreenSelector.style.display = 'flex'
            gameOverScoreSelector.textContent += this.scoreElement.textContent.toString()
            if (this.scoreElement.textContent > this.hiscore) {
                this.hiscore = parseInt(this.scoreElement.textContent)
                hiscoreSelector.textContent = `Best Score: ${this.hiscore}`
            }
            window.innerWidth > 500 ? restartMessageSelector.textContent = 'Press space or click to restart' : restartMessageSelector.textContent = 'Tap to restart'
            window.addEventListener('keyup', this.clearGame)
            window.addEventListener('click', this.clearGame)
        }

        clearGame(event) {
            if (event.key === ' ' || event.type === "click") {
                gameOverScreenSelector.style.display = 'none';
                gameOverScoreSelector.textContent = 'Score: ';
                scoreElementSelector.textContent = 0;
                while (obstacleContainer.firstChild) {
                    obstacleContainer.removeChild(obstacleContainer.lastChild);
                }
                while (obstacleContainer2.firstChild) {
                    obstacleContainer2.removeChild(obstacleContainer2.lastChild);
                }
                game.resetTimers();
                game.removeClearGameListener();
            }
        }

        resetTimers() {
            this.birdSpeed = 0;
            this.birdTop = initialBirdPosition;
            this.pull = setInterval(() => { game.pullBird() }, 20);
            this.generateObstacles = setInterval(() => { game.generateObstacle() }, 2000);
            this.moveObstacles = setInterval(() => { game.moveObstacle() }, 20);
            game.jump()
        }

        removeClearGameListener() {
            window.removeEventListener('keyup', this.clearGame)
            window.removeEventListener('click', this.clearGame)
        }

    }
}