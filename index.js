require("dotenv").config();
const express = require("express");
const {json} = require("body-parser");
const cors = require("cors");
const {getTareas, crearTarea, borrarTarea, actualizarEstado, actualizarTexto } = require("./db");

//instancia de Express
const servidor = express();

servidor.use(cors());

servidor.use(json());

servidor.use("/mentirillas",express.static("./estaticos"));

servidor.get("/tareas", async (peticion, respuesta) => {
    try{
        let tareas = await getTareas();

        // Mapea las tareas para devolver (_id, tarea, terminada) y crea una propiedad id y le asigna el valor de la variable _id
        tareas = tareas.map( ({_id, tarea, terminada}) => { return {id: _id, tarea, terminada} } );

        respuesta.json(tareas);

    }catch(error){
        respuesta.status(500);
        respuesta.json(error);
    }
});

servidor.post("/tareas/nueva", async (peticion, respuesta, siguiente) => {
    let {tarea} = peticion.body;

    if(tarea && tarea.trim() != ""){

        try{
            let id = await crearTarea({tarea});
            return respuesta.json({id});

        }catch(error){
            respuesta.status(500);
            return respuesta.json(error);
        }
    }

    siguiente ({ error : "falta el argumento tarea en el objeto JSON" });
    
});

servidor.delete("/tareas/borrar/:id([0-9a-fA-F]{24})", async (peticion, respuesta) => {
    try{
        let cantidad = await borrarTarea(peticion.params.id);
        respuesta.json({ resultado : cantidad > 0 ? "ok" : "ko" });

    }catch(error){
        
        respuesta.status(500);
        respuesta.json(error);
    }
});

servidor.put("/tareas/actualizar/:id([0-9a-fA-F]{24})/:operacion(1|2)", async (peticion, respuesta) => {
    // Obtiene el número de la solicitud y lo convierte a número
    let operacion = Number(peticion.params.operacion);

    // Array de funciones de operaciones a realizar [0,1]
    let operaciones = [actualizarTexto,actualizarEstado];

    let {tarea} = peticion.body;

    // Verifica si la operación es para actualizar el texto y, filtrar si no hay tarea comprobar si esta vacia
    if(operacion == 1 && (!tarea || tarea.trim() == "")){
        return siguiente({ error : "falta el argumento tarea en el objeto JSON" });
    }
    
    try{
        // Ejecuta la operación correspondiente (0 o 1) en la base de datos
        // Obtiene el valor del parámetro id de la URL de la solicitud y, 
        // verifica el valor de la variable operacion, 
        // si la operación es igual a 0, actualiza texto de la tarea. Si la operación es 1 actualiza el estado
        let cantidad = await operaciones[operacion - 1](peticion.params.id, operacion == 1 ? tarea : null);

        // Imprime la cantidad de tareas actualizadas en la consola 0-1
        console.log(cantidad);

        respuesta.json({ resultado : cantidad ? "ok" : "ko "});

    }catch(error){
        respuesta.status(500);
        respuesta.json(error);
    }
});



servidor.use((peticion,respuesta) => {
    respuesta.status(404);
    respuesta.json({ error : "not found" });
});

servidor.use((error, peticion, respuesta, siguiente) => {
    respuesta.status(400);
    respuesta.json({ error : "petición no válida" });
});

//Inicia el servidor y lo hace escuchar en el puerto especificado en la variable de entorno 'PORT'
servidor.listen(process.env.PORT);