var fruitAssets = {}; // Objet servant à stocker les ressources d'images (level-FruitAsset)
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("gameboard");
const ctx = canvas.getContext("2d");

var game; // objet représentant le jeu en cours

var bg_color = "#ffe89d"; // Couleur de fond de l'interface de jeu

// paramètres du sol
var floorHeight = 50; // hauteur du sol
var floorCoverHeight = 10; // hauteur de surface du sol
var floorInColor = "#7b5438"; // couleur du sol
var floorCoverColor = "#b68a51"; // couleur de la surface du sol

// Taille de la zone de dessin des fruits
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
let width = window.innerWidth;
let height = window.innerHeight - floorHeight;

// L'accélération gravitationelle étant en m/s², et le canvas mesuré en pixels, nous gardons un ratio entre cette accélération et sa représentation à l'écran
// Ainsi ici nous utilisons un facteur 100, soit 100 px / s²
const gravity = 980;

var levelMax = 0;

var score = 0; // Score courant du joueur

// Localisation de la ligne d'alerte
var isWarning = false;
var warningLineY = 100;

var isGameOver = false; // Booléen: est-ce que la partie est terminée

var lastClickTime; // Timestamp du dernier clic

// préparation de l'interface de jeu
var preBox = document.getElementById("pre-box"); // interface de lancement d'une partie
var gameBox = document.getElementById("game-box"); // interface de jeu
var gameOverBox = document.getElementById("game-over-box"); // interface de fin de partie

var btnStart = document.getElementById("btn-play"); // bouton play
var btnRestart = document.getElementById("btn-restart"); // bouton reset
var scoreDom = document.getElementById("score"); // élément du DOM affichant le score

// affichage de l'interface de jeu
function showGame(e) {
	preBox.style.display = "none";
	gameBox.style.display = "block";
	gameOverBox.style.display = "none";
	lastClickTime = new Date();
}

btnStart.onclick = showGame; // gestion du clic sur le bouton play

// lecture de l'effet audio de fusion de fruits
function playMergeMusic() {
	var myAuto = document.getElementById("merge");
	myAuto.play();
}

// lecture de l'effet audio de lancement d'un fruit
function playDropMusic() {
	var myAuto = document.getElementById("drop");
	myAuto.play();
}

// affichage de l'interface de fin de partie
function showGameOver() {
	isGameOver = true;
	preBox.style.display = "none";
	gameBox.style.display = "none";
	gameOverBox.style.display = "block";
	scoreDom.innerText = "Score : " + score;
}

// Relancer une partie
function restart() {
	preBox.style.display = "none";
	gameBox.style.display = "block";
	gameOverBox.style.display = "none";
	// réinitialisation des paramètres de jeu
	game.circles.length = 0;
	isGameOver = false;
	isWarning = false;
	score = 0;
	game.process();
}

btnRestart.onclick = restart; // gestion du clic sur le bouton relancer une partie

// objet représentant le modèle d'un fruit
function FruitAsset(path, size) {
	this.path = path;
	this.size = size;
	this.img = new Image();
}

// initialisation des modèles des fruits
function initFruitAssets(callback) {
	fruitAssets["1"] = new FruitAsset("images/52.png", 52);
	fruitAssets["2"] = new FruitAsset("images/80.png", 80);
	fruitAssets["3"] = new FruitAsset("images/108.png", 108);
	fruitAssets["4"] = new FruitAsset("images/119.png", 119);
	fruitAssets["5"] = new FruitAsset("images/153.png", 153);
	fruitAssets["6"] = new FruitAsset("images/183.png", 183);
	fruitAssets["7"] = new FruitAsset("images/193.png", 193);
	fruitAssets["8"] = new FruitAsset("images/258.png", 258);
	fruitAssets["9"] = new FruitAsset("images/308.png", 308);
	fruitAssets["10"] = new FruitAsset("images/309.png", 309);
	fruitAssets["11"] = new FruitAsset("images/408.png", 408);
	// itération sur les propriétés de l'objet fruitAssets
	let count = 0;
	let imgNum = 0;

	for (level in fruitAssets) {
		imgNum++;
		levelMax++;
	}

	for (level in fruitAssets) {
		let fruitAsset = fruitAssets[level];
		let img = fruitAsset.img;

		img.onload = function() {
			count++;

			if (count >= imgNum)
				callback();

		};
		img.src = fruitAsset.path;
	}
}

/**
 * Objet représentant un vecteur
 */
class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	/**
     * addition de vecteurs
     * @param {Vector} v
     * @returns
     */
	add(v) {
		return new Vector(this.x + v.x, this.y + v.y);
	}

	/**
     * soustraction de vecteurs
     * @param {Vector} v
     * @returns
     */
	substract(v) {
		return new Vector(this.x - v.x, this.y - v.y);
	}

	/**
     * multiplication de vecteurs
     * @param {Vector} s
     * @returns
     */
	multiply(s) {
		return new Vector(this.x * s, this.y * s);
	}

	/**
     * projection de vecteurs
     * @param {Vector} v
     * @returns
     */
	dot(v) {
		return this.x * v.x + this.y * v.y;
	}

	/**
     * normalisation de vecteur
     * @returns Vecteur normalisé
     */
	normalize() {
		let distance = Math.sqrt(this.x * this.x + this.y * this.y);

		return new Vector(this.x / distance, this.y / distance);
	}
}

class Circle {
	constructor(context, x, y, level, vx, vy, cor = 1, mass = 1) {
		this.context = context;
		this.x = x;
		this.y = y;
		this.level = level;
		// récupération du rayon en fonction du niveau du fruit
		this.r = fruitAssets[level].size / 2;
		this.vx = vx;
		this.vy = vy;
		this.mass = mass;
		this.cor = cor;
		this.delFlag = false;
	}

	// affichage d'un fruit
	draw() {
		var asset = fruitAssets[this.level];

		if (!asset)
			asset = fruitAssets["1"];

		let img = asset.img;
		this.context.drawImage(img, this.x - this.r, this.y - this.r);
	}

	/**
     * Vérification de collision avec un autre fruit
     * @param {Circle} other
     */
	checkCollideWith(other) {
		let collideEvent = false; // retour de la collision

		if (this.isCircleCollided(other)) {
			// si les deux fruits qui entrent en contact sont de même niveau => montée de niveau
			if (this.level === other.level) {
				this.level++;

				if (this.level > levelMax) {
					showGameOver();

					return;
				}
				let otherR = fruitAssets[this.level].size / 2;
				this.y = this.y - (otherR - this.r);
				this.r = otherR;
				other.delFlag = true;
				// on augmente le score
				score++;
				// effet sonore de fusion
				playMergeMusic();
			} else {
				this.changeVelocityAndDirection(other);
			}
			collideEvent = true;
		}

		return collideEvent;
	}

	/**
     * si la distance est plus petite que la somme des rayons des deux fruits, alors il y a eu collision
     * @param {Circle} other
     * @returns
     */
	isCircleCollided(other) {
		let squareDistance =
            (this.x - other.x) * (this.x - other.x) +
            (this.y - other.y) * (this.y - other.y);
		let squareRadius = (this.r + other.r) * (this.r + other.r);

		return squareDistance <= squareRadius;
	}

	/*
	 * Changement de la vitesse et direction après collision de deux fruits. Seule la vitesse dans la direction de collision change
	 * La direction tangeante est invariante, et ainsi le problème de collision en 2 dimensions peut être converti en un problème en une dimension
     * @param {Circle} other
     */
	changeVelocityAndDirection(other) {
		// création des vecteurs des deux fruits
		let velocity1 = new Vector(this.vx, this.vy);
		let velocity2 = new Vector(other.vx, other.vy);

		// Vecteur dans la direction de la collision des fruits
		let vNorm = new Vector(this.x - other.x, this.y - other.y);

		// Normalisation du vecteur dans la direction de la collision, et obtention de sa vitesse (direction tangeante)
		let unitVNorm = vNorm.normalize();
		let unitVTan = new Vector(-unitVNorm.y, unitVNorm.x);

		// Obtention de la projection du vecteur vitesse dans la direction tangeante à la collision
		let v1n = velocity1.dot(unitVNorm);
		let v1t = velocity1.dot(unitVTan); // Vitesse constante v1 dans la direction tangeante

		let v2n = velocity2.dot(unitVNorm);
		let v2t = velocity2.dot(unitVTan); // Vitesse constante v2 dans la direction tangeante

		// Valeur minimale du facteur de récupération
		let cor = Math.min(this.cor, other.cor);

		// Les deux fruits de masses égales échangent leur vitesse dans la direction centrale de collision
		// 
		let v1nAfter =
            (this.mass * v1n +
                other.mass * v2n +
                cor * other.mass * (v2n - v1n)) /
            (this.mass + other.mass);

		// Après collision, si les masses sont identiques, le vecteur vitesse dans la direction de collision des deux fruits est interchangé 
		// avec le vecteur vitesse des deux fruits
		let v2nAfter =
            (this.mass * v1n +
                other.mass * v2n +
                cor * this.mass * (v1n - v2n)) /
            (this.mass + other.mass);

		// 
		// Une vitesse de fruit est inférieure à la deuxième, les deux fruits se séparent
		if (v1nAfter < v2nAfter)
			return;


		// Obtention des vecteurs vitesse des deux fruits dans la direction tangeante
		let v1VectorNorm = unitVNorm.multiply(v1nAfter);
		let v1VectorTan = unitVTan.multiply(v1t);

		let v2VectorNorm = unitVNorm.multiply(v2nAfter);
		let v2VectorTan = unitVTan.multiply(v2t);

		// calcul de la vélocité après collision
		let velocity1After = v1VectorNorm.add(v1VectorTan);
		let velocity2After = v2VectorNorm.add(v2VectorTan);

		this.vx = velocity1After.x;
		this.vy = velocity1After.y;

		other.vx = velocity2After.x;
		other.vy = velocity2After.y;
	}

	/**
     * mise à jour de l'interface de jeu
     * @param {number} seconds
     */
	update(seconds) {
		this.vy += gravity * seconds; // accélération gravitationnelle
		this.x += this.vx * seconds;
		this.y += this.vy * seconds;
	}
}

class Gameboard {
	constructor() {
		this.startTime;
		this.init();
	}

	// initialisation de l'interface de jeu
	init() {
		this.circles = [];
		let level = 1;
		let circle = new Circle(
			ctx,
			width / 2,
			fruitAssets[level].size / 2,
			level,
			0,
			0
		);
		this.preCircle = circle;
		window.requestAnimationFrame(this.process.bind(this));
	}

	// vérification du franchissement de la ligne d'alerte
	checkWarning(onFinish) {
		this.circles.forEach((e) => {
			if (e.y - e.r < warningLineY + 20) {
				isWarning = true;

				if (e.y - e.r < warningLineY)
					showGameOver();

			}
		});
		onFinish();
	}

	// détection des collisions
	checkCollision() {
		for (let i = 0; i < this.circles.length; i++) {
			for (let j = i + 1; j < this.circles.length; j++) {
				let collision = this.circles[i].checkCollideWith(
					this.circles[j]
				);
			}
		}
	}

	// événement de fin de collisions pour supprimer les fruits fusionnés
	deleteUpgrade() {
		this.circles.forEach((circle, index, attr) => {
			if (circle.delFlag)
				attr.splice(index, 1);

		});
	}

	/**
     * détection de collision avec les murs
     */
	checkEdgeCollision() {
		// coefficient de restitution de l'énergie après la collision avec un mur
		const cor = 0.3;
		this.circles.forEach((circle) => {
			// collision avec les murs de gauche/droite
			if (circle.x <= circle.r) {
				circle.vx = -circle.vx * cor;
				circle.x = circle.r;
			} else if (circle.x >= width - circle.r) {
				circle.vx = -circle.vx * cor;
				circle.x = width - circle.r;
			}

			// collision avec le sol/plafond
			if (circle.y <= circle.r) {
				circle.vy = -circle.vy * cor;
				circle.y = circle.r;
			} else if (circle.y >= height - circle.r) {
				circle.vy = -circle.vy * cor;
				circle.y = height - circle.r;
			}
		});
	}

	// gestion de l'affichage du fond d'écran
	drawBc() {
		ctx.fillStyle = bg_color;
		ctx.fillRect(0, 0, width, height);
		// affichage de la surface du sol
		ctx.fillStyle = floorCoverColor;
		ctx.fillRect(0, height, width, height + floorHeight);

		// affichage du sol
		ctx.fillStyle = floorInColor;
		ctx.fillRect(
			0,
			height + floorCoverHeight,
			width,
			height + floorHeight - floorCoverHeight
		);

		// affichage du score
		ctx.lineWidth = 2;
		ctx.strokeStyle = "red";
		ctx.font = "45px Arial";
		ctx.strokeText(score, 10, 50);

		// affichage de la ligne ligne d'alerte lorsque le joueur est sur le point d'atteindre la limite haute
		if (isWarning)
			this.drawWarning();

	}

	// affichage de la ligne d'alerte
	drawWarning() {
		ctx.strokeStyle = "#ff0000";
		ctx.lineWidth = 3;
		ctx.moveTo(0, warningLineY);
		ctx.lineTo(width, warningLineY);
		ctx.stroke();
	}

	// boucle de jeu
	process(now) {
		if (!this.startTime)
			this.startTime = now;


		if (isGameOver)
			return;

		let seconds = (now - this.startTime) / 1000;
		this.startTime = now;

		for (let i = 0; i < this.circles.length; i++)
			this.circles[i].update(seconds);


		this.checkEdgeCollision();
		this.checkCollision();
		this.deleteUpgrade();

		// affichage du fond d'écran de jeu
		this.drawBc();

		this.preCircle.draw(ctx);

		for (let i = 0; i < this.circles.length; i++) {
			let circle = this.circles[i];
			circle.draw(ctx);
		}
		window.requestAnimationFrame(this.process.bind(this));
	}
}

// génération d'un nombre aléatoire compris entre minNum et maxNum
function randomNum() {
	let num = 1;
	let currentmax = 1;
	game.circles.forEach((e) => {
		if (e.level > currentmax)
			currentmax = e.level;

	});

	// quand le niveau max est de 2 ou moins, génération d'un nombre entre 0 et 3 exclu
	if (currentmax <= 2)
		num = Math.floor(Math.random() * 2) + 1;
	else
		num = Math.floor(Math.random() * (currentmax - 2));


	if (num === 0)
		num = 1;


	return num;
}

// initialisation des fichiers ressource des fruits et du jeu une fois ceux-ci initialisés
initFruitAssets(function() {
	// chargement des fruits terminé
	console.log("Chargement des fruits terminé !");
	game = new Gameboard();

	// gestion de l'événement de clic
	canvas.onclick = function(e) {
		let nowClickTime = new Date();

		if (!lastClickTime)
			lastClickTime = nowClickTime;


		// calcul du temps écoulé entre 2 clics pour empêcher le joueur de cliquer trop fréquemment
		if (
			Math.round(nowClickTime.getTime() - lastClickTime.getTime()) >= 500
		) {
			lastClickTime = nowClickTime;
			game.checkWarning(function() {
				// le fruit tombe une fois le clic relâché, génération aléatoire d'un nouveau fruit
				game.preCircle.x = e.clientX;
				game.circles.push(game.preCircle);
				let level = randomNum();
				game.preCircle = new Circle(
					ctx,
					width / 2,
					fruitAssets[level].size / 2,
					level,
					0,
					0
				);
			});
		}
	};
});
