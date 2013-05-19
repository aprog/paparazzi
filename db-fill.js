var mongoose = require('mongoose');
mongoose.connect('localhost', 'paparazzi');

var crypto = require('crypto');

var userSchema = mongoose.Schema({
	email: String,
	password: String,
	token: String,
    roles: {type: Array, 'default': []}
});

var placeSchema = mongoose.Schema({
	userId: mongoose.Schema.Types.ObjectId,
	celebId: mongoose.Schema.Types.ObjectId,
	message: String,
	loc: {
		lat: Number,
		"long": Number
	},
	ctime: {type: Date, 'default': Date.now}
});

var celebSchema = mongoose.Schema({
	name: String,
	about: String
});

var User = mongoose.model('User', userSchema);
var Place = mongoose.model('Place', placeSchema);
var Celeb = mongoose.model('Celeb', celebSchema);


/*
	Generates users with predefined names.
*/
function generateUsers() {
	var names = ['Adam' ,'Adrian' ,'Aidan' ,'Alan' ,'Allison' ,'Alyssa' ,'Amanda' ,'Amber' ,'Amelia' ,'Bernard' ,'Blake' ,'Brandon' ,'Brian' ,'Beatrice' ,'Belinda' ,'Brianna' ,'Bridjet' ,'Carlos' ,'Charles' ,'Christopher' ,'Cole' ,'Connor' ,'Caleb' ,'Carter' ,'Chase' ,'Christian' ,'Catherine' ,'Cecilia' ,'Celia' ,'Chloe' ,'Christine' ,'David' ,'Dennis' ,'Devin' ,'Diego' ,'Danielle' ,'Deborah' ,'Delia' ,'Destiny' ,'Elijah' ,'Eric' ,'Ethan' ,'Eleanor' ,'Elizabeth' ,'Ella' ,'Emily' ,'Emma' ,'Erin' ,'Evelyn' ,'Francis' ,'Fred' ,'Faith' ,'Fiona' ,'Florence' ,'Freda' ,'Gavin' ,'Geoffrey' ,'George' ,'Gerld' ,'Gilbert' ,'Gordon' ,'Graham' ,'Gloria' ,'Gabriella' ,'Gabrielle' ,'Gladys' ,'Henry' ,'Herbert' ,'Horace' ,'Howard' ,'Haley' ,'Hannah' ,'Helen' ,'Jacob' ,'Jaden' ,'Jake' ,'James' ,'Jason' ,'Jayden' ,'Jeffery' ,'Jeremiah' ,'Jesse' ,'Jesus' ,'John' ,'Jada' ,'Jane' ,'Jasmine' ,'Jenna' ,'Jennifer' ,'Jessica' ,'Jocelyn' ,'Jordan' ,'Josephine' ,'Keith' ,'Kevin' ,'Kyle' ,'Katelyn' ,'Katherine' ,'Kathryn' ,'Kayla' ,'Kaylee' ,'Kimberly' ,'Kylie' ,'Lawrence' ,'Leonars' ,'Lewis' ,'Logan' ,'Louis' ,'Lucas' ,'Leah' ,'Leonora' ,'Leslie' ,'Lillian' ,'Lily' ,'Linda' ,'Lorna' ,'Martin' ,'Mason' ,'Matthew' ,'Michael' ,'Miguel' ,'Madeline' ,'Madison' ,'Makayla' ,'Margaret' ,'Maria' ,'Marisa' ,'Marjorie' ,'Mary' ,'Maya' ,'Megan' ,'Melanie' ,'Melissa' ,'Mia' ,'Michelle' ,'Mildred' ,'Nathaniel' ,'Neil' ,'Nicholas' ,'Noah' ,'Nancy' ,'Natalie' ,'Nicole' ,'Nora' ,'Oliver' ,'Oscar' ,'Oswald' ,'Owen' ,'Olivia' ,'Patrick' ,'Peter' ,'Philip' ,'Paige' ,'Pamela' ,'Patricia' ,'Pauline' ,'Penelope' ,'Priscilla' ,'Reginald' ,'Richard' ,'Robert' ,'Rodrigo' ,'Roger' ,'Rachel' ,'Rebecca' ,'Riley' ,'Rita' ,'Rosalind' ,'Rose' ,'Samuel' ,'Sean' ,'Sebastian' ,'Seth' ,'Simon' ,'Stanley' ,'Sara' ,'Sarah' ,'Savannah' ,'Sharon' ,'Sheila' ,'Shirley' ,'Sierra' ,'Sofia' ,'Sophia' ,'Stephanie' ,'Susan' ,'Sybil' ,'Thomas' ,'Timothy' ,'Tyler' ,'Taylor' ,'Trinity' ,'Vanessa' ,'Victoria' ,'Violet' ,'Virginia' ,'Wallace' ,'Walter' ,'William' ,'Wyatt' ,'Winifred' ,'Xavier' ,'Yvonne' ,'Zachary' ,'Zoe'];
	names.forEach(function(name) {
		var user = new User({
			email: name.toLowerCase() + '@localhost',
			password: crypto.createHash('sha256').update(name.toLowerCase(), 'utf8').digest('hex'),
			token: crypto.createHash('sha256').update(Math.random() + '').digest('hex')
		});
		user.save(function(err, savedUser) {
			if (err) {
				throw err;
			}
			console.log('User ' + savedUser.email + ' was successfully saved');
		});
	});
	// generate user with admin role
	var user = new User({
		email: 'alex@localhost.localdomain',
		password: crypto.createHash('sha256').update('alex', 'utf8').digest('hex'),
		token: crypto.createHash('sha256').update(Math.random() + '').digest('hex'),
		roles: ['admin'],
		_id: '00000000000000000000aaee'
	});
	user.save(function(err, savedUser) {
		if (err) {
			throw err;
		}
		console.log('User ' + savedUser.email + ' was successfully saved');
	});
}

/*
	Generates celebrities with predefined names and about data.
*/
function generateCelebs() {
	var names = ['Jennifer Lopez', 'Oprah Winfrey', 'Justin Bieber', 'Rihanna', 'Lady Gaga', 'Britney Spears', 'Kim Kardashian', 'Katy Perry', 'Tom Cruise', 'Steven Spielberg', 'Taylor Swift', 'Tiger Woods', 'Angelina Jolie', 'Donald Trump', 'LeBron James', 'Beyonce Knowles', 'Elton John', 'Simon Cowell', 'Rush Limbaugh', 'Tyler Perry', 'Paul McCartney', 'Jennifer Aniston', 'Glenn Beck', 'Adele', 'Bon Jovi', 'Dr. Dre', 'Kobe Bryant', 'Brad Pitt', 'Ryan Seacrest', 'Howard Stern', 'Roger Federer', 'David Beckham', 'Manny Pacquiao', 'Ellen DeGeneres', 'Michael Bay', 'George Lucas', 'James Patterson', 'Jay-Z', 'Jerry Bruckheimer', 'Peyton Manning', 'David Letterman', 'Sean Diddy Combs', 'Kristen Stewart', 'Cristiano Ronaldo', 'Kanye West', 'Leonardo Dicaprio', 'Rafael Nadal', 'Phil Mickelson', 'Toby Keith', 'Lionel Messi', 'Ashton Kutcher', 'Floyd Mayweather', 'Kenny Chesney', 'Dick Wolf', 'Sandra Bullock', 'Johnny Depp', 'Adam Sandler', 'Will Smith', 'Cameron Diaz', 'Tom Brady', 'Gisele Bundchen', 'Mark Burnett', 'Alex Rodriguez', 'Jerry Seinfeld', 'Tom Hanks', 'Stephen King', 'Taylor Lautner', 'Brad Paisley', 'Lil Wayne', 'Dwayne Johnson', 'Maria Sharapova', 'Ben Stiller', 'Khloe Kardashian Odom', 'Seth MacFarlane', 'Charlize Theron', 'Sofia Vergara', 'Serena Williams', 'Alec Baldwin', 'Janet Evanovich', 'Julia Roberts', 'Eva Longoria', 'John Grisham', 'Meryl Streep', 'Tiesto', 'J.K. Rowling', 'Sarah Jessica Parker', 'Li Na', 'Hugh Laurie', 'Reese Witherspoon', 'Jeff Dunham', 'Larry The Cable Guy', 'Skrillex', 'Tina Fey', 'Kate Moss', 'Ray Romano', 'Zooey Deschanel', 'Bethenny Frankel', 'Tim Allen', 'Melissa McCarthy', 'Adriana Lima'];

	names.forEach(function(name) {
		var celeb = new Celeb({
			name: name,
			about: 'Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Donec sodales sagittis magna.'
		});
		celeb.save(function(err, celeb) {
			if (err) {
				throw err;
			}
			console.log('Celebrity ' + celeb.name + ' was successfully saved');
		});
	});
}

/*
	Helper function for getting random number with
	fixed digits in specified range.
*/
function getRandomInRange(from, to, fixed) {
	// toFixed returns String, * 1 converts to Number
	return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
}

/*
	Generates places with random user and celebrity data.
*/
function generatePlaces() {
	User.find({}, function(err, users) {
		if (err) {
			throw err;
		}

		Celeb.find({}, function(err, celebs) {
			var count_to_call = 1000;
			function savePlace(called) {
				if (called < count_to_call) {
					randomUserId = users[Math.floor(Math.random() * users.length)]._id;
					randomCelebId = celebs[Math.floor(Math.random() * celebs.length)]._id;

					var place = new Place({
						userId: randomUserId,
						celebId: randomCelebId,
						message: 'Etiam ultricies nisi vel augue.',
						loc: {
							lat: getRandomInRange(-90, 90, 5),
							"long": getRandomInRange(-180, 180, 5)
						}
					});
					place.save(function(err, place) {
						if (err) {
							throw err;
						}
						console.log('Place ' + called + ' with lat: ' + place.loc.lat + ' long: ' + place.loc.long + ' was successfully saved');
						// after Place will be saved - we output the
						// result to console and continuing
						// save places (i.e. writting real-time status to console)
						savePlace(++called);
					});
				}
			}
			savePlace(0);
		});
	});
}

//generateUsers();
//generateCelebs();
//generatePlaces();
