const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./pool');

//middleware
app.use(cors());
app.use(express.json());

const Port = process.env.PORT || 5000 ;

pool.connect({
    host : 'localhost',
    port : '5432',
    database : 'music-pro-x',
    user : 'postgres',
    password : 'rohitkk432'
})

//Routes

//-------------------------------------------------------------------------------------------------//

//users table used for login//

//find existing user with email 
app.get('/users/:email',async (req,res)=>{
    try {
        const {email}=req.params;
        const user = await pool.query("SELECT * FROM users WHERE email = $1;" ,[email] );
        res.json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

//adding user to database
app.post('/users',async (req,res)=>{
    try {
        const {email}=req.body;
        const newUser = await pool.query("INSERT INTO users (email) VALUES ($1) RETURNING *;",[email]);
        res.json(newUser.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

//-------------------------------------------------------------------------------------------------//

//songs (getting all songs database at start itself) 

//getting all songs
app.get('/songs',async (req,res)=>{
    try {
        const songs = await pool.query("SELECT * FROM songs ;");
        res.json(songs.rows);
    } catch (err) {
        console.error(err.message);
    }
});

app.post('/playlistQueue',async(req,res)=>{
    try {
        const {user_id,playlist_number}=req.body;
        const newSong = await pool.query("INSERT INTO queue (user_id,song_id)SELECT user_id , song_id FROM (SELECT user_id, song_id ,title ,singer,duration,imgpath,audiopath,playlist_number FROM  (SELECT * FROM playlist WHERE (user_id = $1 AND playlist_number=$2)) AS userplaylist JOIN songs ON songs.id = userplaylist.song_id) AS playlist",[user_id,playlist_number]);
        res.json(newSong.rows);
    } catch (err) {
        console.error(err.message);
    }
})

//-------------------------------------------------------------------------------------------------//

// queue table

//getting full queue of a user
app.get('/queue/:userId',async (req,res)=>{
    try {
        const {userId}=req.params;
        const queue = await pool.query("SELECT song_id ,title ,singer,duration,imgpath,audiopath FROM  (SELECT * FROM queue WHERE user_id = $1) AS userqueue JOIN songs ON songs.id = userqueue.song_id;" ,[userId] );
        res.json(queue.rows);
    } catch (err) {
        console.error(err.message);
    }
});


app.get('/queue/:user_id/:song_id',async (req,res)=>{
    try {
        const {user_id,song_id}=req.params;
        const song = await pool.query("SELECT * FROM queue WHERE (user_id = $1 AND song_id = $2);" ,[user_id, song_id] );
        res.json(song.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

//posting a song to user queue
app.post('/queue',async (req,res)=>{
    try {
        const {user_id,song_id}=req.body;
        const newSong = await pool.query("INSERT INTO queue (user_id,song_id) VALUES ($1,$2) RETURNING *;",[user_id,song_id]);
        res.json(newSong.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

//deleting single specific song from queue
app.delete('/queue',async (req,res)=>{
    try {
        const {user_id,song_id}=req.body;
        const delSong = await pool.query("DELETE FROM queue WHERE (user_id = $1 AND song_id = $2) RETURNING *;" ,[user_id , song_id] );
        res.json(delSong.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

//deleting entire queue
app.delete('/queue/:userId',async (req,res)=>{
    try {
        const {userId}=req.params;
        const delQueue = await pool.query("DELETE FROM queue WHERE (user_id = $1) RETURNING *;" ,[userId] );
        res.json(delQueue.rows);
    } catch (err) {
        console.error(err.message);
    }
});


//-------------------------------------------------------------------------------------------------//
// liked 

//getting full liked-list of a user
app.get('/liked/:userId',async (req,res)=>{
    try {
        const {userId}=req.params;
        const liked = await pool.query("SELECT song_id ,title ,singer,duration,imgpath,audiopath FROM  (SELECT * FROM liked WHERE user_id = $1) AS userliked JOIN songs ON songs.id = userliked.song_id;" ,[userId]);
        res.json(liked.rows);
    } catch (err) {
        console.error(err.message);
    }
});

//getting specific song from user liked
app.get('/liked/:user_id/:song_id',async (req,res)=>{
    try {
        const {user_id,song_id}=req.params;
        const song = await pool.query("SELECT * FROM liked WHERE (user_id = $1 AND song_id = $2);" ,[user_id , song_id] );
        res.json(song.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

//posting a song to user queue
app.post('/liked',async (req,res)=>{
    try {
        const {user_id,song_id}=req.body;
        const newSong = await pool.query("INSERT INTO liked (user_id,song_id) VALUES ($1,$2) RETURNING *;",[user_id,song_id]);
        res.json(newSong.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

//deleting single specific song from liked
app.delete('/liked',async (req,res)=>{
    try {
        const {user_id,song_id}=req.body;
        const delSong = await pool.query("DELETE FROM liked WHERE (user_id = $1 AND song_id = $2) RETURNING *;" ,[user_id , song_id] );
        res.json(delSong.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

//deleting entire liked
app.delete('/liked/:userId',async (req,res)=>{
    try {
        const {userId}=req.params;
        const delLiked = await pool.query("DELETE FROM liked WHERE (user_id = $1) RETURNING *;" ,[userId] );
        res.json(delLiked.rows);
    } catch (err) {
        console.error(err.message);
    }
});

//-------------------------------------------------------------------------------------------------//

//playlist 
//getting full specific  playlist of a user
app.get('/playlist/:user_id/:playlist_number',async (req,res)=>{
    try {
        const {user_id,playlist_number}=req.params;
        const playlist = await pool.query("SELECT user_id, song_id ,title ,singer,duration,imgpath,audiopath,playlist_number FROM  (SELECT * FROM playlist WHERE (user_id = $1 AND playlist_number=$2)) AS userplaylist JOIN songs ON songs.id = userplaylist.song_id;" ,[user_id,playlist_number]);
        res.json(playlist.rows);
    } catch (err) {
        console.error(err.message);
    }
});

//getting specific song from specific playlist of a user
app.get('/playlist/:user_id/:song_id/:playlist_number',async (req,res)=>{
    try {
        const {user_id,playlist_number,song_id}=req.params;
        const song = await pool.query("SELECT * FROM playlist WHERE (user_id = $1 AND song_id = $2 AND playlist_number=$3);" ,[user_id , song_id, playlist_number] );
        res.json(song.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

//posting a song to a specific playlist of a user
app.post('/playlist',async (req,res)=>{
    try {
        const {user_id,song_id,playlist_number}=req.body;
        const newSong = await pool.query("INSERT INTO playlist (user_id,song_id,playlist_number) VALUES ($1,$2,$3) RETURNING *;",[user_id,song_id,playlist_number]);
        res.json(newSong.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

//deleting single specific song from a specific playlist
app.delete('/playlist',async (req,res)=>{
    try {
        const {user_id,playlist_number,song_id}=req.body;
        const delSong = await pool.query("DELETE FROM playlist WHERE (user_id = $1 AND song_id = $2 AND playlist_number=$3) RETURNING *;" ,[user_id , song_id, playlist_number] );
        res.json(delSong.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

//deleting entire specific playlist
app.delete('/playlist/full',async (req,res)=>{
    try {
        const {user_id,playlist_number}=req.body;
        const delPlaylist = await pool.query("DELETE FROM playlist WHERE (user_id = $1 AND playlist_number= $2) RETURNING *;" ,[user_id,playlist_number] );
        res.json(delPlaylist.rows);
    } catch (err) {
        console.error(err.message);
    }
});

//-------------------------------------------------------------------------------------------------//

//listening
app.listen(Port,()=>{
    console.log(`server started on port ${Port} `);
});