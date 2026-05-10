DELIMITER $$

CREATE FUNCTION fn_calcular_multa(id_pag INT, valor_parcela DECIMAL(10,2)) 
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE data_pagamento DATE;
    DECLARE data_vencimento DATE;
    DECLARE multa DECIMAL(10,2) DEFAULT 0;

    SELECT dtPag, dtVenci INTO data_pagamento, data_vencimento 
    FROM pagamento WHERE idPagamento = id_pag;

    -- Se pagou depois do vencimento, aplica 2% de multa
    IF data_pagamento > data_vencimento THEN
        SET multa = valor_parcela * 0.02;
    END IF;

    RETURN multa;
END $$

DELIMITER ;