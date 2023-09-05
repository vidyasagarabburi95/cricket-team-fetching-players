const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const databasePath = path.join(__dirname, "cricketTeam.db");

const app = express();
app.use(express.json());

let dataBase = null;

const intiliazeDbAndServer = async () => {
  try {
    dataBase = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://loacalhost:3000/");
    });
  } catch (error) {
    console.log(`DB:error ${error.message}`);
    process.exit(1);
  }
};

intiliazeDbAndServer(); //---->for intilizing db with server

//-->for returning array of players
const convertDbObjectToResponseObject = (eachPlayer) => {
  return {
    playerId: eachPlayer.player_id,
    playerName: eachPlayer.player_name,
    jerseyNumber: eachPlayer.jersey_number,
    role: eachPlayer.role,
  };
};
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team`;
  const playerArray = await dataBase.all(getPlayersQuery);
  response.send(
    playerArray.map((eachPlayer) => {
      convertDbObjectToResponseObject(eachPlayer);
    })
  );
});

//-->for returning only one player

app.get("/players/:playerId/" async (request,response)=>{
    const {playerId}=request.params;
    const onlyPlayerQuery=`SELECT * FROM cricket_team WHERE player_id=${playerId}`;
    const player=await dataBase.get(onlyPlayerQuery);
    response.send(
        convertDbObjectToResponseObject(player)
    );
});

//-->for creating a new data in to the table

app.post("/players/",async (request,response)=>{
    const {playerName,jerseyNumber,role}=request.body
    const postingQuery=`INSERT INTO cricket_team
   (playerName,jerseyNumber,role) 
   VALUES 
   ('${playerName}',${jerseyNumber},'${role}')`;
   const postingPlayerDetails=dataBase.run(postingQuery);
   response.send("Player Added to Team");
});

//-->for updating existing data with put;

app.put("/players/:playerId/",async (request,response)=>{
    const {playerName,jerseyNumber,role}=request.body;
    const {playerId}=request.params;
    const updatePlayerQuery=`
    UPDATE cricket_team
    SET 
    player_name='${playerName}',
    jersey_number='${jerseyNumber}',
    role='${role}'
    WHERE player_id=${playerId};`;
    const playerUpdatedQuery= await dataBase.run(updatePlayerQuery);
    response.send(playerUpdatedQuery);
})
//-->deleting query
app.delete("/players/:playerId/",(request,response)=>{
    const {playerId}=request.params;
    const deleteQuery=`DELETE FROM cricket_team WHERE player_id=${playerId}`;
    dataBase.run(deleteQuery);
    response.send("Player Removed");
});
module.exports=app;