

DELIMITER $$

CREATE TRIGGER tr_validar_sensor_ativo
BEFORE INSERT ON coletaTemp
FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(20);
    
    -- Busca o status na tabela sensor usando o ID enviado pelo simulador
    SELECT status_sen INTO v_status 
    FROM sensor 
    WHERE idSensor = NEW.fkSensor;
    
    -- Se o status não for 'Ativo', o MySQL cancela o INSERT do simulador
    IF v_status <> 'Ativo' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Operação cancelada: O sensor não está ativo.';
    END IF;
END $$

DELIMITER ;