DELIMITER $$

CREATE PROCEDURE pr_dashboard_tanque_semanal(id_tanque INT)
BEGIN
    -- Retorna estatísticas baseadas na tabela coletatemp vinculada ao tanque
    SELECT 
        t.nomeTanque,
        MIN(c.temperatura) AS temp_minima,
        MAX(c.temperatura) AS temp_maxima,
        AVG(c.temperatura) AS temp_media,
        COUNT(c.idColeta) AS total_leituras
    FROM tanque t
    JOIN sensor s ON s.fkTanque = t.idTanque
    JOIN coletatemp c ON c.fkSensor = s.idSensor
    WHERE t.idTanque = id_tanque 
      AND c.dtColeta >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY t.idTanque;
END $$

DELIMITER ;