<?php    
    // 1. Configuración
    $host = "localhost";
    $user = "root"; 
    $pass = "";     
    $db   = "integradora";

    // 2. Conexión
    $conexion = mysqli_connect($host, $user, $pass, $db, 3306);

    if (!$conexion) {
        die("Conexión fallida: " . mysqli_connect_error());
    }

    // 3. Recibir los 5 datos (Asegúrate de guardar el archivo después de pegar esto)
    $nombre   = $_POST['name'];
    $correo   = $_POST['email'];
    $telefono = $_POST['telefono'];
    $escuela  = $_POST['escuela']; 
    $carrera  = $_POST['carrera']; 

    // 4. Consulta corregida (Nombre de tabla: 'prospecto' sin la S final)
    $sql = "INSERT INTO prospecto (nombre, email, telefono, escuela, carrera) 
            VALUES ('$nombre', '$correo', '$telefono', '$escuela', '$carrera')";

    // 5. Ejecutar
    if (mysqli_query($conexion, $sql)) {
        echo "<h2>¡ÉXITO TOTAL!</h2>";
        echo "Se guardó: <br>";
        echo "Nombre: $nombre <br>";
        echo "Escuela: $escuela <br>";
        echo "Carrera: $carrera <br>";
        echo "<br><a href='http://localhost:5173'>Volver al formulario</a>";
    } else {
        echo "Error al guardar: " . mysqli_error($conexion);
    }

    mysqli_close($conexion);
?>