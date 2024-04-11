require("dotenv").config();
const {MongoClient, ObjectId} = require("mongodb");

function conectar(){
    return MongoClient.connect(process.env.URL_DB);
}

function getTareas(){
    return new Promise(async (ok,ko) => {
        try{
            const conexion = await conectar();
            let coleccion = conexion.db("tareas").collection("tareas");       
            let tareas = await coleccion.find({}).toArray();
            conexion.close();
            ok(tareas);

        }catch(error){
            ko({error : "error en la base de datos"});
        }
    } );
}

function crearTarea(tarea){
    return new Promise(async (ok,ko) => {
        try{
            const conexion = await conectar();
            let coleccion = conexion.db("tareas").collection("tareas");       
            let {insertedId} = await coleccion.insertOne(tarea);
            conexion.close();
            ok(insertedId);

        }catch(error){
            ko({error : "error en la base de datos"});
        }
    } );
}

function borrarTarea(id){
    return new Promise(async (ok,ko) => {
        try{
            const conexion = await conectar();
            let coleccion = conexion.db("tareas").collection("tareas");       
            let {deletedCount} = await coleccion.deleteOne({_id: new ObjectId(id)});
            conexion.close();
            ok(deletedCount);

        }catch(error){
            ko({error : "error en la base de datos"});
        }
    } );
}

module.exports = {getTareas, crearTarea, borrarTarea};