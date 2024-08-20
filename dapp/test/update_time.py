import subprocess
import requests
from datetime import datetime

# URL da API para obter a hora atual
API_URL = "http://worldtimeapi.org/api/ip"

def get_current_time():
    try:
        response = requests.get(API_URL)
        response.raise_for_status()
        data = response.json()
        # Obter a hora atual no formato 'YYYY-MM-DDTHH:MM:SS.ssssss+HH:MM'
        utc_time = data['datetime']
        # Converter para formato 'YYYY-MM-DD HH:MM:SS'
        # Remover frações de segundos e offset de fuso horário
        time_str = utc_time.split('+')[0].split('.')[0]
        return datetime.strptime(time_str, "%Y-%m-%dT%H:%M:%S").strftime("%Y-%m-%d %H:%M:%S")
    except requests.RequestException as e:
        print(f"Erro ao obter a hora da API: {e}")
        return None

def set_system_time(time_str):
    try:
        # Ajustar o horário do sistema
        subprocess.run(['date', '-s', time_str], check=True)
        print(f"Horário do sistema atualizado para {time_str}")
    except subprocess.CalledProcessError as e:
        print(f"Erro ao atualizar o horário: {e}")

if __name__ == "__main__":
    current_time = get_current_time()
    print(current_time)
    
    if current_time:
        set_system_time(current_time)
