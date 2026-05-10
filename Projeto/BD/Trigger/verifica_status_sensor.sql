
DELIMITER $$

CREATE TRIGGER tr_validar_sensor_ativo
BEFORE INSERT ON coletatemp
FOR EACH ROW
BEGIN
    DECLARE status_sensor_1 VARCHAR(20);
    
    SELECT status_sensor INTO status_sensor_1 FROM sensor 
    WHERE idSensor = NEW.fkSensor;

    IF status_sensor_1 <> 'Ativo' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Operação cancelada: O sensor não está ativo.';
    END IF;
END $$

DELIMITER ;