import sqlite3

BASE_PATH = "./lib/database/scripts/"

class X509Database():

  __model = [
    'id',
    'raw_cert',
    'public_key',
    'country',
    'state',
    'locality',
    'organization',
    'common_name',
    'active',
    'generation_date',
    'expiration_date'
  ]

  #===================================#
  def __init__(self, db_path) -> None:
    self.__db_path = db_path
    self.__CREATE_PATH = f"{BASE_PATH}create.sql"
    self.__INSERT_PATH = f"{BASE_PATH}insert.sql"
    self.__QUERY_PATH = f"{BASE_PATH}query.sql"
    self.__UPDATE_PATH = f"{BASE_PATH}update.sql"

  #==========================#
  # Gets the sql script by the path
  def __get_script(self, path):
    try:
      with open(path, "r") as create_sql_file:
        return create_sql_file.read()
    except:
      raise Exception("Could not get sql script")
    
  #==============================#
  def create_table(self) -> None:
    try:  
      conn = sqlite3.connect(self.__db_path)

      conn.cursor()\
        .execute(self.__get_script(self.__CREATE_PATH))

      conn.commit()
      conn.close()
    except Exception as e:
      raise Exception(f"Creation error\n{e}")

  #=======================================#
  def add_cert(self, data: tuple) -> None:
    try:
      # Connection
      conn = sqlite3.connect(self.__db_path)
      cursor = conn.cursor()

      # Verifying duplicates
      cursor.execute(self.__get_script(self.__QUERY_PATH), (data[2],))
      if cursor.fetchone():
        conn.close()
        raise Exception("This public key already exists")

      # Inserting
      cursor.execute(self.__get_script(self.__INSERT_PATH), data)
      conn.commit()

      # Closing connection
      conn.close()
    except Exception as e: 
      raise Exception(f"Insertion error\n{e}")
      

  #==========================================#
  def query_cert(self, pub_key: str) -> tuple:
    try:  
      conn = sqlite3.connect(self.__db_path)
      
      results = conn.cursor()\
        .execute(self.__get_script(self.__QUERY_PATH), (pub_key,))\
        .fetchone()
      
      conn.close()
      return results
    except Exception as e:
      raise Exception(f"Query error\n{e}")


  #===================================#
  def revoke_cert(self, pub_key: str) -> None:
    try:  
      conn = sqlite3.connect(self.__db_path)
      cursor = conn.cursor()
      
      # Checking the existence
      results = cursor\
        .execute(self.__get_script(self.__QUERY_PATH), (pub_key,))\
        .fetchone()

      if not results:
        conn.close()
        raise Exception("This public key does not exists")

      if results[8] == 0:
        conn.close()
        raise Exception("This certificate is already revocated")

      # Updating
      cursor.execute(self.__get_script(self.__UPDATE_PATH), (0, pub_key))
      conn.commit()
      conn.close()

    except Exception as e:
      raise Exception(f"Revocation error\n{e}")

  #==================#
  @classmethod
  def get_model(cls):
    return cls.__model
