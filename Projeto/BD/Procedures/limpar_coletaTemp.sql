DELIMITER $$

CREATE PROCEDURE pr_limpar_coletas_antigas()
BEGIN 

    DELETE FROM coletatemp 
    WHERE dtColeta < DATE_SUB(NOW(), INTERVAL 3 MONTH);
    
    OPTIMIZE TABLE coletatemp;
END $$

DELIMITER ;