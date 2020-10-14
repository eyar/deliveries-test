import { debug } from "console";

export function getOrmConfig() {
    let OrmConfig;

    if (process.env.NODE_ENV !== 'test') {
        OrmConfig = {
            type: 'postgres',
            url: 'postgres://xxxpysug:XCBfQYn3P7Ci8_5vvjA2VcPbkon38rNu@balarama.db.elephantsql.com:5432/xxxpysug',
            entities: ['dist/**/**.entity.js'],
            synchronize: true,
            secret: 'getPackage'
        };
    } else {
        OrmConfig = {
            type: 'sqlite',
            database: './db/test-db.sql',
            entities: ['src/**/**.entity.ts'],
            synchronize: true,
            dropSchema: true,
            secret: 'getPackage'
        };
    }
    return OrmConfig;
}
