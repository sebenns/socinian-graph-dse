import neo4j, { Driver, QueryResult, Session } from 'neo4j-driver';
import { Nullable } from '../types.js';

export default class Neo4jDriver {
  public static instance: Driver;

  public static createDatabaseConnection(): Driver {
    const host: Nullable<string> = process.env.NEO4J_HOST;
    const username: Nullable<string> = process.env.NEO4J_USERNAME;
    const password: Nullable<string> = process.env.NEO4J_PASSWORD;

    if (!host || !username || !password) {
      console.error('[Neo4j Driver]', 'Missing environment variables for either host, username or password');
      console.error('Please check your configurations and restart the server.');
      process.exit(1);
    }

    this.instance = neo4j.driver(host, neo4j.auth.basic(username, password), {
      disableLosslessIntegers: true,
    });

    console.success('[Neo4j Driver]', 'Connection has been established.');
    return this.instance;
  }

  public static async runQuery(query: string, ...args: unknown[]): Promise<Nullable<QueryResult>> {
    const session: Session = this.instance.session();
    let queryResult: Nullable<QueryResult> = null;

    try {
      console.debug('[Neo4j Driver]', 'Query:', query, 'Args:', ...args);
      queryResult = await session.run(query, ...args);
    } catch (error: unknown) {
      console.error('[Neo4j Driver]', 'Could not run a query, because:', error);
    } finally {
      await session.close();
    }

    return queryResult;
  }
}
