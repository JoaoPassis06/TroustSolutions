CREATE EVENT ev_limpeza_trimestral_coletas
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
  CALL pr_limpar_coletas_antigas();