DmgFunc = {

	trueHit: function(hit) { // chance for average of 2 RN
		if (hit <= 50) {
			return Fraction((2*(hit*hit)+hit),100);
		} else {
			var m = hit-50;
			return Fraction((5050 + 199*m - 2*m*m),100);
		}
	},

	fatesHit: function(hit) { // chance for (3A+B)/4 RNG for hit >= 50
		if (hit < 50) return hit;
		else if (hit <= 100) { // can't write formulas so i'll just do this
			var resultsBkwd = [10000, 9999, 9993, 9982, 9965, 9943, 9916, 9883, 9845, 9802, 9753, 9699, 9640, 9575, 9505, 9430, 9349, 9263, 9172, 9075, 8973, 8866, 8753, 8635, 8512, 8383, 8250, 8117, 7983, 7850, 7717, 7583, 7450, 7317, 7183, 7050, 6917, 6783, 6650, 6517, 6383, 6250, 6117, 5983, 5850, 5717, 5583, 5450, 5317, 5183, 5050];
			var m = 100-hit;
			return Fraction(resultsBkwd[m],100);
		} else return Fraction(hit); // no invalid array access
	},

	chanceTable: function (hit, dmg, crit, truehit) {
		/* hit rate and crit rate : n out of 100. dmg is value */
		/* returns: object containing all damage possibilities */
		if (truehit === 'truehit') {
			hit = DmgFunc.trueHit(hit);
		} else if (truehit === 'fates_hit') {
			hit = DmgFunc.fatesHit(hit);
		} // otherwise leave it as is
		var critChance = Fraction(Fraction(hit).mul(crit),(100*1.0));
		var ct = [
			{damage: 0, damageReceived: 0, chance: Fraction(100-hit)},
			{damage: dmg, damageReceived: 0, chance: Fraction(hit).sub(critChance)}
		];
		if (critChance !== 0) ct.push({damage: 3*dmg, damageReceived: 0, chance: Fraction(critChance)});
		return ct;
	},

	counterattackTable: function (t1, t2, hp1, hp2) {
		// t1: chance table from player 1
		// t2: chance table from player 2
		// hp1: integer value of player 1's health
		// hp2: integer value of player 2's health
		// return: damage taken and received from each player
		var chanceTable = [];
		for (var i = 0; i < t1.length; i++) {
			if (t1[i].damage >= hp2 || t1[i].damageReceived >= hp1) { // counterattack doesn't happen if either party is dead
				chanceTable.push(t1[i]); 
			} else {
				for (var j = 0; j < t2.length; j++) {
					var combineChance = Fraction((t1[i].chance.mul(t2[j].chance))).div(100);
					var chanceObject = { // resulting table after counterattack
						damage: t1[i].damage, 
						damageReceived: +t1[i].damageReceived+t2[j].damage, 
						chance: combineChance
					};
					if (!combineChance.equals(0)) chanceTable.push(chanceObject);
				}
			}
		}
		return chanceTable;
	},

	// handle player 1's double attack
	doubleAttackTable: function (t1, t2, hp1, hp2) {
		// t1: aggregated table from player 1
		// t2: chance table from player 1
		// hp1: integer value of player 1's health
		// hp2: integer value of player 2's health
		// return: damage taken and received from each player
		var chanceTable = [];
		for (var i = 0; i < t1.length; i++) {
			if (t1[i].damage >= hp2 || t1[i].damageReceived>= hp1) {
				chanceTable.push(t1[i]); // 
			}
			else {
				for (var j = 0; j < t2.length; j++) {
					var combineChance = Fraction((t1[i].chance.mul(t2[j].chance))).div(100);
					var chanceObject = {
						damage: +t1[i].damage+t2[j].damage, 
						damageReceived: t1[i].damageReceived, 
						chance: combineChance
					};
					if (!combineChance.equals(0)) chanceTable.push(chanceObject);
				}
			}
		}
		return chanceTable;
	},

	computeTable_simple: function(p1, p2, truehit) {
		// Returns table.
		var t1 = DmgFunc.chanceTable(p1.hit, p1.damage, p1.crit, truehit);
	    var t2 = DmgFunc.chanceTable(p2.hit, p2.damage, p2.crit, truehit);
	    var speed1 = p1.speed;
	    var speed2 = p2.speed;

	    // initial attack: t1
	    var dmgTable = t1;
	    if (p1.brave) {
	    	dmgTable = DmgFunc.doubleAttackTable(dmgTable, t1, p1.hp, p2.hp);
	    }
	    // counter-attack: ctatk
	    dmgTable = DmgFunc.counterattackTable(dmgTable, t2, p1.hp, p2.hp);
	    if (p2.brave) {
	    	dmgTable = DmgFunc.counterattackTable(dmgTable, t2, p1.hp, p2.hp);
	    }

	    // strikes twice if speed 4 higher (5 in awakening)
	    if (speed1 >= speed2 + 4) {
	    	dmgTable = DmgFunc.doubleAttackTable(dmgTable, t1, p1.hp, p2.hp);
	    	if (p1.brave) {
	    		dmgTable = DmgFunc.doubleAttackTable(dmgTable, t1, p1.hp, p2.hp);
	    	}
	    } else if (speed2 >= speed1 + 4) {
	    	dmgTable = DmgFunc.counterattackTable(dmgTable, t2, p1.hp, p2.hp);
	    	if (p2.brave) {
	    		dmgTable = DmgFunc.counterattackTable(dmgTable, t2, p1.hp, p2.hp);
	    	}
	    }
	    return DmgFunc.mergeChances(dmgTable);

	},

	mergeChances: function(t) {
		var hash = {};
		var result = t.reduce(function(r, e) {
		  var key = 'damage'+e.damage+'|damageReceived'+e.damageReceived;
		  if(!hash[key]) {
		  	hash[key] = e;
		  	r.push(hash[key]);
		  }
		  else {
		  	hash[key].chance.add(e.chance);
		  }
		  return r;
		}, []);
		return result;
	},

	applySkills: function (unitProperties, chances, skillTable) {
		/* input: object containing skills and chance to proc */
		/* merge some together if possible */

	}

};