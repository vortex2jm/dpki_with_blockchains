INSERT INTO Certificates (
    id,
    raw_cert,
    public_key,
    country,
    state,
    locality,
    organization,
    common_name,
    active,
    generation_date,
    expiration_date
) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
);
