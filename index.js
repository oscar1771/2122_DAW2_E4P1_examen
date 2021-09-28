const data = require ('./service');

const Players  = {
    LEFT: 0,
    RIGHT: 1
}

const Combat = {
    SUCCESS: 1,
    FAILED: 0
}

const execute = async () => {
    try 
    {
        //Leemos el JSON y almacenamos en initData
        const result = await data.fetchData();
        
        const heroData = result.data;
        const numHeroes = heroData.length;

        const randomHeroesIndexes = get2RandomNumbers(0, numHeroes);

        //Creamos nuestros heroes para el combate
        const combatPlayers = createHeroes(randomHeroesIndexes, heroData);

        //Iniciamos los jugadores. Comienza el jugador
        let currentFighter = Players.LEFT;
        let currentDefender = Players.RIGHT;

        //Extraemos los datos necesarios   
        const combatPlayersAttr = new Array(2);
       
        //Extraemos los atributos
        combatPlayersAttr[0] = Object.assign(combatPlayers[0].powerstats);
        combatPlayersAttr[1] = Object.assign(combatPlayers[1].powerstats);

        //Añadimos el nombre
        combatPlayersAttr[0].name = combatPlayers[0].name;
        combatPlayersAttr[1].name = combatPlayers[1].name;

        //Calculamos y añadimos la vida de inicio
        combatPlayersAttr[0].life = calculateLife(combatPlayersAttr[0]);
        combatPlayersAttr[1].life = calculateLife(combatPlayersAttr[1]);
        
        //console.log(combatPlayersAttr);
        
        //EMPIEZA EL COMBATE!!!!
        console.log('Empieza el combate entre ' + combatPlayersAttr[0].name + ' y ' + combatPlayersAttr[1].name + " !!!!!!!!!");
        
        //1) Determinamos quién comienza a pelear
        const leftPlayerSkill  = combatPlayersAttr[Players.LEFT].strength + combatPlayersAttr[Players.LEFT].speed;
        const rightPlayerSkill = combatPlayersAttr[Players.RIGHT].strength + combatPlayersAttr[Players.RIGHT].speed;

        showAttrs(combatPlayersAttr);
        
        let areBothFightersAlive = combatPlayersAttr[0].life > 0 && combatPlayersAttr[1].life > 0;

        //Vemos quién comienza. Si hay empate comienza el de la IZDA 
        let idStriker  = (leftPlayerSkill >= rightPlayerSkill) ? Players.LEFT : Players.RIGHT;
        let idDefender = idStriker ^ 1; //El defensor será el Atacante XOR 1

        console.log('El primer asalto es para ' + combatPlayersAttr[idStriker].name);
        console.log('-----------------------------');

        let round = 0;

        while (areBothFightersAlive)
        {
            round++;

            console.log('Comienza el asalto ' + round);
            console.log('-----------------------------');
                      
            console.log('El asalto es para: ' + combatPlayersAttr[idStriker].name);

            //2) Determinamos si el atacante golpea
            let random_D100 = createRandomNumber(1, 100);
            const hasStrikeSuccess = (random_D100 <= combatPlayersAttr[idStriker].combat) ? 
                                                                                            Combat.SUCCESS : Combat.FAILED;
                      
            if (hasStrikeSuccess)
            {
                console.log(combatPlayersAttr[idStriker].name + " obtiene un " + random_D100 + " y ataca con éxito");              
            }
            else
            {
                console.log(combatPlayersAttr[idStriker].name + " ha fallado");
                //Cambiamos el turno y volvemos a empezar
                idStriker ^= 1;
                idDefender ^= 1;
                showAttrs(combatPlayersAttr);
                continue;

            }

            //3) Vemos si hay defensa por parte del defensor
            const defenseValue = Math.ceil(combatPlayersAttr[idStriker].combat + combatPlayersAttr[idStriker].speed) / 2;
                      
            random_D100 = createRandomNumber(1, 100);
            const hasDefenseSuccess = random_D100 <= defenseValue ? Combat.SUCCESS : Combat.FAILED;

            if (hasDefenseSuccess)
            {
                console.log(combatPlayersAttr[idDefender].name + " obtiene un " + random_D100 + " y logra defender el ataque");
                updateDurability(combatPlayersAttr[idStriker], 3);
                //Cambiamos el turno y volvemos a empezar
                idStriker ^= 1;
                idDefender ^= 1;
                showAttrs(combatPlayersAttr);
                continue;
            }
            else
            {
                console.log(combatPlayersAttr[idDefender].name + " obtiene un " + random_D100 + " y no logra defender el ataque");
                
            }

            //4) Calculamos el daño del ataque
            let random_D20 = createRandomNumber(1, 20);
            const weaponDamage = Math.ceil((combatPlayersAttr[idStriker].power * combatPlayersAttr[idStriker].durability) / 100);
            const realDamage   = Math.ceil((weaponDamage + combatPlayersAttr[idStriker].strength) * random_D20 / 100);
            console.log(combatPlayersAttr[idStriker].name + " obtiene un " + random_D20 + ", empuña su arma y ejerce un daño de " + realDamage + " puntos");
            updateDurability(combatPlayersAttr[idStriker], 1);
            updateLife(combatPlayersAttr[idDefender], realDamage);

            //5) Resultado al final del ataque actual
            showAttrs(combatPlayersAttr);

            areBothFightersAlive = combatPlayersAttr[0].life > 0 && combatPlayersAttr[1].life > 0;

            //Cambio de turno y volvemos a empezar
            idStriker ^= 1;
            idDefender ^= 1;
         
        }

        //Fin del combate 
        combatPlayersAttr[0].life <= 0 ? console.log(combatPlayersAttr[0].name + " ha sido derrotado.") :
        combatPlayersAttr[1].life <= 0 ? console.log(combatPlayersAttr[1].name + " ha sido derrotado.") : console.log ("IMPOSIBLE");

        return result;       
    }
    catch (error)
    {
        console.log(error.message);
    }
}

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
    return ( Math.floor(Math.random() * (max-min)) + min);
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



