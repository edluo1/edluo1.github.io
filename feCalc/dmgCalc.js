DmgFunc = {

	chanceTable: function (hit, dmg, crit, truehit) {
		/* hit rate and crit rate : n out of 100. dmg is value */
		/* returns: object containing all damage possibilities */
		if (truehit) {
			if (hit <= 50) {
				hit = (2*(hit*hit)+hit)/100;
			} else {
				m = hit-50;
				hit = (5050 + 199*m - 2*m*m)/100;
			}
		}
		var critChance = (hit*crit)/(100*1.0);
		var ct = [
			{damage: 0, damageReceived: 0, chance: 100-hit},
			{damage: dmg, damageReceived: 0, chance: hit-critChance}
		];
		if (critChance !== 0) ct.push({damage: 3*dmg, damageReceived: 0, chance: critChance});
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
			for (var j = 0; j < t2.length; j++) {
				var combineChance = (t1[i].chance*t2[j].chance)/(100*1.0);
				var chanceObject = { // resulting table after counterattack
					damage: t1[i].damage, 
					damageReceived: +t1[i].damageReceived+t2[j].damage, 
					chance: combineChance
				};
				if (t1[i].damage >= hp2 || t1[i].damageReceived >= hp1) {
					chanceObject.damageReceived = t1[i].damageReceived; // damage not received if enemy dead
				}
				if (combineChance !== 0) chanceTable.push(chanceObject);
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
			for (var j = 0; j < t2.length; j++) {
				var combineChance = (t1[i].chance*t2[j].chance)/(100*1.0);
				var chanceObject = {
					damage: +t1[i].damage+t2[j].damage, 
					damageReceived: t1[i].damageReceived, 
					chance: combineChance
				};
				if (t1[i].damage >= hp2 || chanceObject.damageReceived >= hp1) {
					chanceObject.damage = t1[i].damage; // 2nd attack not done if dead
				}
				if (combineChance !== 0) chanceTable.push(chanceObject);
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
		  else hash[key].chance += e.chance;
		  return r;
		}, []);
		return result;
	},

	applySkills: function (unitProperties, chances, skillTable) {
		/* input: object containing skills and chance to proc */
		/* merge some together if possible */

	}

};