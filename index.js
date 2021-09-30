const data = require ('./service');

const Position  = {
    LEFT: 0,
    RIGHT: 1
}

const Combat = {
    SUCCESS: 1,
    FAILED: 0
}

const Player = {
    STRIKER: 0,
    DEFENDER: 1
}


const execute = async () => {
    try 
    {
        //Leemos el JSON y almacenamos en initData
        const result = await data.fetchData();
        
        const heroData = result.data;
        const numHeroes = heroData.length;

        const randomHeroesIndexes = get2RandomNumbers(0, numHeroes - 1);

        //Creamos nuestros heroes para el combate
        const combatPlayers = createHeroes(randomHeroesIndexes, heroData);
              
        //Creamos objetos nuevos con los siguientes campos para mejor manejo y los introducimos en el array combatPlayersAttr
        // {name, intelligence, strength, speed, durability, power, combat, life}

        const combatPlayersAttr = new Array(2);
        combatPlayersAttr[0] = Object.assign({ name: combatPlayers[0].name}, 
                                               combatPlayers[0].powerstats,
                                             { life: calculateLife(combatPlayers[0].powerstats) }
                                            );
        
        combatPlayersAttr[1] = Object.assign({ name: combatPlayers[1].name}, 
                                               combatPlayers[1].powerstats,
                                             { life: calculateLife(combatPlayers[1].powerstats) }
                                            );
        
        
        //EMPIEZA EL COMBATE!!!!
        console.log('Empieza el combate entre ' + combatPlayersAttr[0].name + ' y ' + combatPlayersAttr[1].name + " !!!!!!!!!");
        console.log('----------------------------------------------------------------');
        
        //1) Determinamos quién comienza a pelear
        const leftPlayerSkill  = combatPlayersAttr[Position.LEFT].strength + combatPlayersAttr[Position.LEFT].speed;
        const rightPlayerSkill = combatPlayersAttr[Position.RIGHT].strength + combatPlayersAttr[Position.RIGHT].speed;

        showAttrs(combatPlayersAttr);
        
        
        //Vemos quién comienza. Si hay empate comienza el de la IZDA 
        Player.STRIKER  = (leftPlayerSkill >= rightPlayerSkill) ? Position.LEFT : Position.RIGHT;
        Player.DEFENDER = Player.STRIKER ^ 1; //El defensor será el Atacante XOR 1

        console.log('El primer asalto es para ' + combatPlayersAttr[Player.STRIKER].name);
        console.log('-----------------------------');

        //Contador de rondas
        let round = 0;

        let areBothFightersAlive = combatPlayersAttr[0].life > 0 && combatPlayersAttr[1].life > 0;
       
        while (areBothFightersAlive)
        {
            round++;

            console.log('Comienza el asalto ' + round);
            console.log('-----------------------------');
                      
            console.log('El asalto es para: ' + combatPlayersAttr[Player.STRIKER].name);

            //2) Determinamos si el atacante golpea
            let random_D100 = createRandomNumber(1, 100);
            const hasStrikeSuccess = (random_D100 <= combatPlayersAttr[Player.STRIKER].combat) ? Combat.SUCCESS : Combat.FAILED;
                      
            if (hasStrikeSuccess)
            {
                console.log(combatPlayersAttr[Player.STRIKER].name + " obtiene un " + random_D100 + " y ataca con éxito");              
            }
            else
            {
                console.log(combatPlayersAttr[Player.STRIKER].name + " obtiene un " + random_D100 + " y ha fallado");
                //Cambiamos el turno y volvemos a empezar
                Player.STRIKER ^= 1;
                Player.DEFENDER ^= 1;
                showAttrs(combatPlayersAttr);
                continue;

            }

            //3) Vemos si hay defensa por parte del defensor
            const defenseValue = Math.ceil(combatPlayersAttr[Player.STRIKER].combat + combatPlayersAttr[Player.STRIKER].speed) / 2;
                      
            random_D100 = createRandomNumber(1, 100);
            const hasDefenseSuccess = random_D100 <= defenseValue ? Combat.SUCCESS : Combat.FAILED;

            if (hasDefenseSuccess)
            {
                console.log(combatPlayersAttr[Player.DEFENDER].name + " obtiene un " + random_D100 + " y logra defender el ataque");
                updateDurability(combatPlayersAttr[Player.STRIKER], 3);
                //Cambiamos el turno y volvemos a empezar
                Player.STRIKER ^= 1;
                Player.DEFENDER ^= 1;
                showAttrs(combatPlayersAttr);
                continue;
            }
            else
            {
                console.log(combatPlayersAttr[Player.DEFENDER].name + " obtiene un " + random_D100 + " y no logra defender el ataque");              
            }

            //4) Calculamos el daño del ataque
            let random_D20 = createRandomNumber(1, 20);
            const weaponDamage = Math.ceil((combatPlayersAttr[Player.STRIKER].power * combatPlayersAttr[Player.STRIKER].durability) / 100);
            const realDamage   = Math.ceil((weaponDamage + combatPlayersAttr[Player.STRIKER].strength) * random_D20 / 100);
            console.log(combatPlayersAttr[Player.STRIKER].name + " obtiene un " + random_D20 + ", empuña su arma y ejerce un daño de " + realDamage + " puntos");
            updateDurability(combatPlayersAttr[Player.STRIKER], 1);
            updateLife(combatPlayersAttr[Player.DEFENDER], realDamage);

            //5) Resultado al final del ataque actual
            showAttrs(combatPlayersAttr);

            areBothFightersAlive = combatPlayersAttr[0].life > 0 && combatPlayersAttr[1].life > 0;

            //Cambio de turno y volvemos a empezar
            Player.STRIKER ^= 1;
            Player.DEFENDER ^= 1;
         
        }

        //Fin del combate 
        combatPlayersAttr[0].life <= 0 ? console.log(combatPlayersAttr[0].name + " ha sido derrotado.") :
        combatPlayersAttr[1].life <= 0 ? console.log(combatPlayersAttr[1].name + " ha sido derrotado.") : console.log ("ERROR: IMPOSIBLE");
        
        return result;       
    }
    catch (error)
    {
        console.log(error.message);
    }
}


// ----------------------------------------
// FUNCIONES AUXILIARES
// ----------------------------------------
function get2RandomNumbers(min, max)
{
    const firstNumber = createRandomNumber(min, max);
    let secondNumber = firstNumber;
    while (secondNumber === firstNumber)
    {
        secondNumber = createRandomNumber(min, max);
    } 

    return new Array(firstNumber, secondNumber);
    
}

function createRandomNumber(min, max)
{
    return ( Math.floor(Math.random() * (max - min + 1)) + min);
}

function createHeroes(indexArray, heroData)
{
    let combatPlayers = [];
    combatPlayers.push(heroData[indexArray[0]]);
    combatPlayers.push(heroData[indexArray[1]]);
    return combatPlayers;
}

function calculateLife(player)
{
    return(Math.min(player.strength * 5, 300));
}

function updateDurability(player, value)
{  
    player.durability = Math.max(0, player.durability -= value);
}

function updateLife(player, value)
{
    player.life -= value;
}

function showAttrs(combatPlayersAttr)
{
    console.log(combatPlayersAttr[0]);
    console.log(combatPlayersAttr[1]);
    console.log('-----------------------------');
    console.log('-----------------------------');
}


//Ejecutamos el combate
execute().then(res => res);