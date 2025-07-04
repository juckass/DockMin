import { parseTableOutput } from './parse-table-output';

describe('parseTableOutput', () => {
  it('devuelve un array vacío si la salida no tiene tabla', () => {
    expect(parseTableOutput('')).toEqual([]);
    expect(parseTableOutput('Solo un mensaje')).toEqual([]);
    expect(parseTableOutput('Header\n')).toEqual([]);
  });

  it('parsea correctamente una tabla simple', () => {
    const output = `NAME      STATE    PORTS\nweb       running  80/tcp\ndb        exited   5432/tcp`;
    expect(parseTableOutput(output)).toEqual([
      { NAME: 'web', STATE: 'running', PORTS: '80/tcp' },
      { NAME: 'db', STATE: 'exited', PORTS: '5432/tcp' },
    ]);
  });

  it('parsea columnas con espacios variables', () => {
    const output = `NAME         STATE      PORTS         \nweb_nginx    running    80/tcp        \ndb_postgres  exited     5432/tcp      `;
    expect(parseTableOutput(output)).toEqual([
      { NAME: 'web_nginx', STATE: 'running', PORTS: '80/tcp' },
      { NAME: 'db_postgres', STATE: 'exited', PORTS: '5432/tcp' },
    ]);
  });

  it('ignora líneas vacías y parsea varias filas', () => {
    const output = `NAME   STATE   PORTS\nweb    running 80/tcp\n\ndb     exited  5432/tcp\n`;
    expect(parseTableOutput(output)).toEqual([
      { NAME: 'web', STATE: 'running', PORTS: '80/tcp' },
      { NAME: 'db', STATE: 'exited', PORTS: '5432/tcp' },
    ]);
  });
});
