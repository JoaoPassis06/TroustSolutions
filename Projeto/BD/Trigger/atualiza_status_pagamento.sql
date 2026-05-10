
DELIMITER $$

CREATE TRIGGER tr_atualizar_status_pagamento
BEFORE INSERT ON pagamento
FOR EACH ROW
BEGIN
    IF NEW.dtPag IS NOT NULL THEN
        SET NEW.statusPag = 'Pago';

    ELSE IF NEW.dtVenci < CURDATE() THEN
        SET NEW.statusPag = 'Atrasado';
    ELSE
        SET NEW.statusPag = 'Pendente';
    END IF;

DELIMITER ;