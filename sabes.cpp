#include <iostream>
#include <tins/tins.h>
#include <sys/time.h>
#include <map>
#include <vector>
#include <stdlib.h>
#include <string>
#include <chrono>
#include <iostream>
#include <ctime>
#include <ratio>
#include <math.h>
#include <stdio.h>
#include <algorithm>

using namespace Tins;
using namespace std;

struct ack{
    vector<uint32_t> seq;
    vector<double> timestamp;
    // vector<double> ip_rate;
};

map<string, ack> mapAck;

bool callback(const Packet &packet) {
    // Find the IP layer
    const IP &ip = packet.pdu()->rfind_pdu<IP>(); 
    // Find the TCP layer
    const TCP &tcp = packet.pdu()->rfind_pdu<TCP>(); 
    if(ip.src_addr()!=IPv4Address("140.114.79.80")&&ip.dst_addr()!=IPv4Address("140.114.79.80")||
       tcp.sport()==22||tcp.dport()==22){
        return true;
    }
    // cout << ip.src_addr() << ':' << tcp.sport() << " -> " 
    //      << ip.dst_addr() << ':' << tcp.dport() << " with flag " << tcp.flags() 
    //      << ", seq num: " << tcp.seq() << " ack_num: " << tcp.ack_seq() << " CGWD: " << tcp.window()  <<endl;
    string index = ip.src_addr().to_string()+":"+to_string(tcp.sport())+"->"+ip.dst_addr().to_string()+":"+to_string(tcp.dport());
    // cout << index << ", " << to_string(packet.timestamp().microseconds()) <<endl;
    double sec = packet.timestamp().seconds();
    double ms = packet.timestamp().microseconds();
    double t = sec + (ms/pow(10, (int)(log10(ms)+1)));
    fprintf(stderr, "%lf %lf %f %lf\n", sec, ms, log10(ms), t);
    // cout << sec << " " << ms << " " << log10(ms) << " " << t << endl;
    if(!mapAck.count(index)){ // Not found
        struct ack a;
        a.seq=vector<uint32_t>{tcp.ack_seq()};
        a.timestamp = vector<double>{t};
        mapAck.insert({index, a});
    }
    else{
        map<string, ack>::iterator i = mapAck.find(index);
        if(find(i->second.seq.begin(), i->second.seq.end(), tcp.ack_seq()) != i->second.seq.end()) return true;
        i->second.seq.push_back(tcp.ack_seq());
        i->second.timestamp.push_back(t);
    }
    for(map<string, ack>::iterator it = mapAck.begin(); it != mapAck.end(); ++it){
        for(int i = 0; i < it->second.seq.size(); i++){
            fprintf(stderr, "%s: %u, %10.6lf\n", it->first.c_str(), it->second.seq[i],it->second.timestamp[i]);
            // cout << it->first << ": " << it->second.seq[i] << ", " << it->second.timestamp[i] << endl;
        }
        cout << "============================" <<endl;
    }
    return true;
}

int main() {
    Sniffer("eno1").sniff_loop(callback);
    SnifferConfiguration config;
}