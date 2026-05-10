DELIMITER $$

CREATE PROCEDURE pr_listar_inadimplentes()
BEGIN
    SELECT 
        e.nomeFantasia AS Empresa,
        p.parcela AS Parcela_Atrasada,
        p.dtVenci AS Vencimento,
        DATEDIFF(CURDATE(), p.dtVenci) AS Dias_de_Atraso
    FROM pagamento p
    JOIN plano pl ON p.fkPlano = pl.idPlano
    JOIN empresa e ON pl.fkEmpresa = e.idEmpresa -- Assumindo que plano liga com empresa
    WHERE p.statusPag = 'Atrasado' OR (p.dtPag IS NULL AND p.dtVenci < CURDATE())
    ORDER BY Dias_de_Atraso DESC;
END $$

DELIMITER ;