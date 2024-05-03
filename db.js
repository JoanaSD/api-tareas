// Carga la configuración de variables de entorno
require("dotenv").config();
const {MongoClient, ObjectId} = require("mongodb");

//Retorna una promesa que se resuelve cuando se establece la conexión con la base de datos MongoDB
function conectar(){
    return MongoClient.connect(process.env.URL_DB);
}

function getTareas(){
    return new Promise(async (ok,ko) => {
        try{
            const conexion = await conectar();

            // Obtiene la colección de tareas
            let coleccion = conexion.db("tareas").collection("tareas");
            // Busca todas las tareas en la colección y las convierte en un array       
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
          
            // Inserta la tarea en la colección y obtiene el ID de la tarea insertada
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
            
            // Borra la tarea con el ID de la colección y obtiene la cantidad de documentos borrados (0-1)
            let {deletedCount} = await coleccion.deleteOne({_id: new ObjectId(id)});
            conexion.close();
            ok(deletedCount);

        }catch(error){
            ko({error : "error en la base de datos"});
        }
    } );
}

function actualizarEstado(id){

    return new Promise(async (ok,ko) => {
        
        try{
            const conexion = await conectar();
            let coleccion = conexion.db("tareas").collection("tareas");
            let tarea = await coleccion.findOne({_id: new ObjectId(id)});

            // Si la tarea no existe, se cierra la conexión y se rechaza creando un error
            if(!tarea){
                conexion.close();
                return ko({error : "la tarea no existe"});
            }

            // Cambia el estado de la tarea y lo actualiza en la colección    
            let estado = !tarea.terminada;

            let {modifiedCount} = await coleccion.updateOne({_id: new ObjectId(id)}, {$set: {terminada: estado}});
            conexion.close();
            ok(modifiedCount);

        }catch(error){
            ko({error : "error en la base de datos"});
        }

    });

}

function actualizarTexto(id,tarea){

    return new Promise(async (ok,ko) => {

        try{
        
            const conexion = await conectar();
            let coleccion = conexion.db("tareas").collection("tareas");

            // Actualiza el texto del documento con el ID especifico
            let {modifiedCount} = await coleccion.updateOne({_id: new ObjectId(id)}, {$set: {tarea}});
            conexion.close();
            ok(modifiedCount);

        }catch(error){
            ko({error : "error en la base de datos"});
        }

    });

}


module.exports = {getTareas, crearTarea, borrarTarea, actualizarEstado, actualizarTexto};
