import http, { IncomingMessage, ServerResponse } from 'http'
import axios from 'axios';
import { Feed } from 'feed';
import moment from 'moment';




const fetchProposals = (async () => {
    const feed = new Feed({
        title: "Osmosis Proposal",
        id: "Osmosis proposals feed via Keplr api.",
        copyright: "Osmosis gov",
    });
    const url = 'https://lcd-osmosis.keplr.app/gov/proposals';
    const { data } = await axios.get(url);
    const ooo = data as Response;
    ooo.result = ooo.result.sort((a, b) => b.id - a.id);
    for (const oo of ooo.result) {
        if (!oo.id) continue;
        feed.addItem({
            title: `VotingEnd: ${new Date(Date.parse(oo.voting_end_time)).toUTCString()} **${oo.content.value.title}`,
            link: `https://wallet.keplr.app/#/osmosis/governance?detailId=${oo.id}`,
            date: new Date(Date.parse(oo.submit_time)),
            id: oo.id.toString(),
        });
    }

    return feed;
    interface Response {
        height: number,
        result: GovProposalResponse[]
    }

    interface GovProposalResponse {
        id: number,
        content: {
            type: string,
            value: {
                title: string,
                description: string
            }
        },
        submit_time: string,
        deposit_end_time: string,
        voting_start_time: string,
        voting_end_time: string,
    }
});
const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const feed = await fetchProposals();
    res.writeHead(200, { 'Content-Type': 'application/atom+xml' });
    res.end(feed.atom1());
})

server.listen(4000) // 4000番ポートで起動
